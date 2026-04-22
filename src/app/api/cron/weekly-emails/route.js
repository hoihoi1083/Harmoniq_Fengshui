import { NextResponse } from "next/server";
import { Resend } from "resend";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { calculateAccurateBaZi } from "@/lib/accurateBaziCalculation";
import {
	buildWeeklyAdviceEmailHtml,
	formatBaziSummaryLine,
} from "@/lib/weeklyAdviceEmailHtml";
import {
	generateWeeklyAdviceWithAi,
	STATIC_WEEKLY_EMAIL_COPY,
} from "@/lib/generateWeeklyAdviceAi";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Same secret resolution as other protected email routes — set at least one in prod. */
function cronSecret() {
	return (
		process.env.CRON_SECRET ||
		process.env.WEEKLY_CRON_SECRET ||
		process.env.EMAIL_TEST_SECRET ||
		""
	);
}

function isAuthorized(request) {
	const secret = cronSecret();
	if (!secret) {
		return process.env.NODE_ENV === "development";
	}
	const h =
		request.headers.get("x-cron-secret") ||
		request.headers.get("x-email-test-secret") ||
		request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	return h === secret;
}

function weekRangeLabel() {
	const now = new Date();
	const monday = new Date(now);
	const d = monday.getDay();
	const diff = monday.getDate() - d + (d === 0 ? -6 : 1);
	monday.setDate(diff);
	const sun = new Date(monday);
	sun.setDate(monday.getDate() + 6);
	const fmt = (x) => `${x.getMonth() + 1}/${x.getDate()}`;
	const y = now.getFullYear();
	const w = getWeekNumber(now);
	return `${y}年第${w}週（${fmt(monday)}–${fmt(sun)}）`;
}

function getWeekNumber(d) {
	const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const dayNum = t.getUTCDay() || 7;
	t.setUTCDate(t.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
	return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

function getWeekKey(d = new Date()) {
	const y = d.getUTCFullYear();
	const w = String(getWeekNumber(d)).padStart(2, "0");
	return `${y}-W${w}`;
}

function emailLocalPart(email) {
	const part = String(email).trim().split("@")[0];
	return part || "朋友";
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BIRTHDAY_TS = new Date(1996, 2, 12, 22, 0, 0, 0).getTime();

function hasProvidedBirthday(user) {
	if (!user?.birthDateTime) return false;
	const birthTs = new Date(user.birthDateTime).getTime();
	if (Number.isNaN(birthTs)) return false;
	if (user.birthdayProvided === true) return true;
	return birthTs !== DEFAULT_BIRTHDAY_TS;
}

/**
 * POST /api/cron/weekly-emails
 * Batch-send weekly advice to all users with a valid stored email (cron / manual trigger).
 *
 * Auth: CRON_SECRET or WEEKLY_CRON_SECRET or EMAIL_TEST_SECRET
 *       Header: x-cron-secret, x-email-test-secret, or Authorization: Bearer <secret>
 *
 * Body JSON (optional):
 * - dryRun: true — list users and counts only; no Resend / no AI
 * - skipAi: true — use static sample copy (still builds HTML; no DeepSeek)
 * - limit: number — max users to process (default from WEEKLY_EMAIL_BATCH_LIMIT or 200)
 * - delayMs: number — pause between sends (default 600)
 */
export async function POST(request) {
	try {
		if (!isAuthorized(request)) {
			return NextResponse.json(
				{
					ok: false,
					error:
						"Unauthorized. Set CRON_SECRET (or WEEKLY_CRON_SECRET / EMAIL_TEST_SECRET) and send x-cron-secret or Authorization: Bearer.",
				},
				{ status: 401 }
			);
		}

		if (!process.env.RESEND_API_KEY) {
			return NextResponse.json(
				{ ok: false, error: "RESEND_API_KEY is not configured" },
				{ status: 500 }
			);
		}

		const body = await request.json().catch(() => ({}));
		const dryRun = body.dryRun === true;
		const skipAi = body.skipAi === true;
		const runId =
			(typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
			`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const startedAt = new Date();
		const weekKey = getWeekKey(startedAt);
		const limit = Math.min(
			Math.max(
				1,
				Number(body.limit) ||
					Number(process.env.WEEKLY_EMAIL_BATCH_LIMIT) ||
					200
			),
			5000
		);
		const delayMs = Math.max(
			0,
			Number(body.delayMs) || Number(process.env.WEEKLY_EMAIL_SEND_DELAY_MS) || 600
		);
		const lockTimeoutMs = Math.max(
			60000,
			Number(process.env.WEEKLY_EMAIL_LOCK_TIMEOUT_MS) || 2 * 60 * 60 * 1000
		);

		await connectDB();

		const users = await User.find({
			email: { $exists: true, $nin: [null, ""] },
			weeklyAdviceEnabled: { $ne: false },
			weeklyAdviceLastSentWeek: { $ne: weekKey },
		})
			.select({
				email: 1,
				name: 1,
				birthDateTime: 1,
				userId: 1,
				birthdayProvided: 1,
				weeklyAdviceLastSentWeek: 1,
				weeklyAdviceSendingWeek: 1,
				weeklyAdviceSendingAt: 1,
			})
			.lean()
			.limit(limit);

		const weekLabel = weekRangeLabel();
		const assetBaseUrl =
			process.env.EMAIL_ASSET_BASE_URL?.replace(/\/+$/, "") ||
			"https://www.harmoniqfengshui.com";

		const results = {
			ok: true,
			runId,
			startedAt: startedAt.toISOString(),
			weekLabel,
			weekKey,
			dryRun,
			skipAi,
			limit,
			delayMs,
			lockTimeoutMs,
			totalCandidates: users.length,
			sent: 0,
			wouldSend: 0,
			skipped: 0,
			alreadySentThisWeek: 0,
			lockedByAnotherRun: 0,
			failed: 0,
			/** Addresses Resend accepted this run (to + userId + resendId); capped */
			sentTo: [],
			errors: [],
		};

		const maxSentToLogged = 100;

		for (const user of users) {
			const to = String(user.email || "").trim();
			if (user.weeklyAdviceLastSentWeek === weekKey) {
				results.alreadySentThisWeek += 1;
				results.skipped += 1;
				continue;
			}

			if (!EMAIL_RE.test(to) || !hasProvidedBirthday(user)) {
				results.skipped += 1;
				continue;
			}

			if (dryRun) {
				results.wouldSend += 1;
				continue;
			}

			const now = new Date();
			const staleBefore = new Date(now.getTime() - lockTimeoutMs);
			const claim = await User.updateOne(
				{
					_id: user._id,
					weeklyAdviceLastSentWeek: { $ne: weekKey },
					$or: [
						{ weeklyAdviceSendingWeek: { $exists: false } },
						{ weeklyAdviceSendingWeek: null },
						{ weeklyAdviceSendingWeek: { $ne: weekKey } },
						{
							weeklyAdviceSendingWeek: weekKey,
							weeklyAdviceSendingAt: { $lt: staleBefore },
						},
					],
				},
				{
					$set: {
						weeklyAdviceSendingWeek: weekKey,
						weeklyAdviceSendingAt: now,
					},
				}
			);

			if ((claim?.modifiedCount || 0) === 0) {
				results.lockedByAnotherRun += 1;
				results.skipped += 1;
				continue;
			}

			let birthForBazi = user.birthDateTime
				? new Date(user.birthDateTime)
				: null;
			if (!birthForBazi || Number.isNaN(birthForBazi.getTime())) {
				birthForBazi = new Date(1996, 2, 12, 12, 0, 0);
			}

			const recipientName =
				user.name?.trim() || emailLocalPart(to) || "朋友";
			const bazi = calculateAccurateBaZi(birthForBazi);
			const baziLine = formatBaziSummaryLine(bazi);

			let mainSections;
			let dailyOneLiners;
			let weeklyConclusion;

			if (skipAi) {
				mainSections = [...STATIC_WEEKLY_EMAIL_COPY.mainSections];
				dailyOneLiners = [...STATIC_WEEKLY_EMAIL_COPY.dailyOneLiners];
				weeklyConclusion = STATIC_WEEKLY_EMAIL_COPY.weeklyConclusion;
			} else {
				const ai = await generateWeeklyAdviceWithAi({
					weekLabel,
					birthDateTime: birthForBazi,
					bazi,
					recipientName,
				});
				mainSections = ai.mainSections;
				dailyOneLiners = ai.dailyOneLiners;
				weeklyConclusion = ai.weeklyConclusion;
			}

			const html = buildWeeklyAdviceEmailHtml({
				assetBaseUrl,
				recipientName,
				weekLabel,
				baziLine,
				mainSections,
				dailyOneLiners,
				weeklyConclusion,
			});

			const subject = `[HarmoniqFengShui] 本週運勢｜${weekLabel}`;

			try {
				const sendResult = await resend.emails.send({
					from: "HarmoniqFengShui <noreply@harmoniqfengshui.com>",
					to: [to],
					subject,
					html,
				});

				await User.updateOne(
					{
						_id: user._id,
						weeklyAdviceSendingWeek: weekKey,
					},
					{
						$set: {
							weeklyAdviceLastSentWeek: weekKey,
							weeklyAdviceLastSentAt: new Date(),
						},
						$unset: {
							weeklyAdviceSendingWeek: "",
							weeklyAdviceSendingAt: "",
						},
					}
				);
				results.sent += 1;
				if (results.sentTo.length < maxSentToLogged) {
					results.sentTo.push({
						to,
						userId: user.userId,
						resendId: sendResult?.data?.id ?? null,
					});
				}
			} catch (e) {
				await User.updateOne(
					{
						_id: user._id,
						weeklyAdviceSendingWeek: weekKey,
					},
					{
						$unset: {
							weeklyAdviceSendingWeek: "",
							weeklyAdviceSendingAt: "",
						},
					}
				);
				results.failed += 1;
				const msg = e?.message || String(e);
				if (results.errors.length < 30) {
					results.errors.push({ to, userId: user.userId, error: msg });
				}
			}

			if (delayMs > 0) {
				await sleep(delayMs);
			}
		}
		results.finishedAt = new Date().toISOString();

		return NextResponse.json(results);
	} catch (e) {
		console.error("cron weekly-emails error:", e);
		return NextResponse.json(
			{ ok: false, error: e.message || "batch failed" },
			{ status: 500 }
		);
	}
}
