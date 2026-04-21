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

const resend = new Resend(process.env.RESEND_API_KEY);

function isAuthorized(request) {
	const secret = process.env.EMAIL_TEST_SECRET;
	if (!secret) {
		return process.env.NODE_ENV === "development";
	}
	const h =
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
	const fmt = (x) =>
		`${x.getMonth() + 1}/${x.getDate()}`;
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

function escapeRegex(s) {
	return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Part before @ for greeting when DB has no name */
function emailLocalPart(email) {
	const part = String(email).trim().split("@")[0];
	return part || "朋友";
}

/** Match User by stored email or userId (credentials often use email as userId) */
async function findUserByRecipientEmail(toAddress) {
	const raw = toAddress.trim();
	const re = new RegExp(`^${escapeRegex(raw)}$`, "i");
	return User.findOne({
		$or: [{ email: re }, { userId: re }],
	}).lean();
}

/**
 * POST /api/email/test-weekly
 * Send a sample weekly advice email (template A + 七日一句).
 *
 * Auth: set EMAIL_TEST_SECRET in env, then header x-email-test-secret: <secret>
 *       OR Authorization: Bearer <secret>
 *       If EMAIL_TEST_SECRET is unset, only allowed when NODE_ENV=development.
 *
 * Body JSON:
 * - to: (required) recipient email
 * - name: optional display name
 * - birthDateTime: optional ISO date string for BaZi demo
 * - userId: optional — loads User by userId (birthDateTime + name)
 * - lookupUser: optional true — loads User by `to` email (matches email or userId field)
 * - weeklyConclusion: optional — override「本週小結」paragraph (after AI if both set)
 * - skipAi: optional true — do not call DeepSeek; use static sample or body.mainSections / dailyOneLiners
 * - mainSections / dailyOneLiners: optional — only used when skipAi (must supply full valid arrays if customizing)
 */
export async function POST(request) {
	try {
		if (!isAuthorized(request)) {
			return NextResponse.json(
				{
					ok: false,
					error:
						"Unauthorized. Set EMAIL_TEST_SECRET in .env and send header x-email-test-secret, or run in development without secret.",
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
		const to = body.to?.trim();
		if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
			return NextResponse.json(
				{ ok: false, error: 'Missing or invalid "to" email' },
				{ status: 400 }
			);
		}

		const explicitName = body.name?.trim();
		let birthForBazi = body.birthDateTime
			? new Date(body.birthDateTime)
			: null;

		let recipientName;
		let userLookup = { mode: "none", found: false };

		if (body.lookupUser === true) {
			await connectDB();
			const user = await findUserByRecipientEmail(to);
			userLookup = { mode: "email", found: !!user };
			if (user) {
				recipientName =
					explicitName ||
					user.name?.trim() ||
					emailLocalPart(to) ||
					"朋友";
				if (!body.birthDateTime && user.birthDateTime) {
					birthForBazi = new Date(user.birthDateTime);
				}
			} else {
				recipientName = explicitName || emailLocalPart(to) || "朋友";
			}
		} else if (body.userId) {
			await connectDB();
			const user = await User.findOne({ userId: body.userId }).lean();
			userLookup = { mode: "userId", found: !!user };
			if (user) {
				recipientName =
					explicitName ||
					user.name?.trim() ||
					emailLocalPart(to) ||
					"朋友";
				if (!body.birthDateTime && user.birthDateTime) {
					birthForBazi = new Date(user.birthDateTime);
				}
			} else {
				recipientName = explicitName || "朋友";
			}
		} else {
			recipientName = explicitName || "朋友";
		}

		if (!birthForBazi || Number.isNaN(birthForBazi.getTime())) {
			birthForBazi = new Date(1996, 2, 12, 12, 0, 0);
		}

		const bazi = calculateAccurateBaZi(birthForBazi);
		const baziLine = formatBaziSummaryLine(bazi);
		const weekLabel = weekRangeLabel();

		let mainSections;
		let dailyOneLiners;
		let weeklyConclusion;
		let contentMeta = { source: "ai" };

		if (body.skipAi === true) {
			const hasManual =
				Array.isArray(body.mainSections) &&
				body.mainSections.length >= 3 &&
				Array.isArray(body.dailyOneLiners) &&
				body.dailyOneLiners.length === 7;
			if (hasManual) {
				mainSections = body.mainSections.map((s) => String(s).trim());
				dailyOneLiners = body.dailyOneLiners.map((s) => String(s).trim());
				contentMeta = { source: "manual" };
			} else {
				mainSections = [...STATIC_WEEKLY_EMAIL_COPY.mainSections];
				dailyOneLiners = [...STATIC_WEEKLY_EMAIL_COPY.dailyOneLiners];
				contentMeta = { source: "static_sample" };
			}
			weeklyConclusion =
				body.weeklyConclusion?.trim() ||
				STATIC_WEEKLY_EMAIL_COPY.weeklyConclusion;
		} else {
			const ai = await generateWeeklyAdviceWithAi({
				weekLabel,
				birthDateTime: birthForBazi,
				bazi,
				recipientName,
			});
			mainSections = ai.mainSections;
			dailyOneLiners = ai.dailyOneLiners;
			weeklyConclusion =
				body.weeklyConclusion?.trim() || ai.weeklyConclusion;
			contentMeta = {
				source: ai.source,
				...(ai.error ? { aiError: ai.error } : {}),
			};
		}

		// Email clients must load images from a public HTTPS origin — not localhost.
		const assetBaseUrl =
			process.env.EMAIL_ASSET_BASE_URL?.replace(/\/+$/, "") ||
			"https://www.harmoniqfengshui.com";

		const html = buildWeeklyAdviceEmailHtml({
			assetBaseUrl,
			recipientName,
			weekLabel,
			baziLine,
			mainSections,
			dailyOneLiners,
			weeklyConclusion,
		});

		const subject = `[HarmoniqFengShui] 週運試寄｜${weekLabel}`;

		const result = await resend.emails.send({
			from: "HarmoniqFengShui <noreply@harmoniqfengshui.com>",
			to: [to],
			subject,
			html,
		});

		return NextResponse.json({
			ok: true,
			id: result?.data?.id,
			to,
			subject,
			weekLabel,
			recipientName,
			userLookup,
			content: contentMeta,
			baziUsed: {
				pillars: `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`,
				note: "八字由出生日期時間即時推算；正文由 AI 依八字與本週標籤生成（失敗時使用站內範本）。",
			},
		});
	} catch (e) {
		console.error("test-weekly email error:", e);
		return NextResponse.json(
			{ ok: false, error: e.message || "send failed" },
			{ status: 500 }
		);
	}
}
