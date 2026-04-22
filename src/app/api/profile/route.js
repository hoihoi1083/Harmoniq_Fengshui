import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BIRTHDAY_TS = new Date(1996, 2, 12, 22, 0, 0, 0).getTime();

function getCurrentUserId(session) {
	return session?.user?.userId || session?.user?.email || null;
}

function hasProvidedBirthday(user) {
	if (!user?.birthDateTime) return false;
	const birthTs = new Date(user.birthDateTime).getTime();
	if (Number.isNaN(birthTs)) return false;
	if (user.birthdayProvided === true) return true;
	// Legacy users may have real birthday data but no birthdayProvided flag yet.
	return birthTs !== DEFAULT_BIRTHDAY_TS;
}

function toProfile(user) {
	const hasBirthday = hasProvidedBirthday(user);
	return {
		userId: user.userId,
		name: user.name || "",
		email: user.email || "",
		birthDateTime: user.birthDateTime || null,
		birthdayProvided: hasBirthday,
		hasBirthday,
		weeklyAdviceEnabled: user.weeklyAdviceEnabled !== false,
	};
}

export async function GET() {
	try {
		const session = await auth();
		const userId = getCurrentUserId(session);

		if (!userId) {
			return NextResponse.json(
				{ ok: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();
		const user = await User.findOne({ userId });
		if (!user) {
			return NextResponse.json(
				{ ok: false, error: "User not found" },
				{ status: 404 }
			);
		}
		if (hasProvidedBirthday(user) && user.birthdayProvided !== true) {
			user.birthdayProvided = true;
			user.updatedAt = new Date();
			await user.save();
		}

		return NextResponse.json({ ok: true, profile: toProfile(user) });
	} catch (error) {
		return NextResponse.json(
			{ ok: false, error: error.message || "Failed to load profile" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const session = await auth();
		const userId = getCurrentUserId(session);

		if (!userId) {
			return NextResponse.json(
				{ ok: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json().catch(() => ({}));
		const nextName =
			typeof body.name === "string" ? body.name.trim() : undefined;
		const nextEmail =
			typeof body.email === "string" ? body.email.trim() : undefined;
		const nextBirthDateTime = body.birthDateTime;
		const nextWeeklyAdviceEnabled =
			typeof body.weeklyAdviceEnabled === "boolean"
				? body.weeklyAdviceEnabled
				: undefined;

		if (nextEmail !== undefined && nextEmail && !EMAIL_RE.test(nextEmail)) {
			return NextResponse.json(
				{ ok: false, error: "Invalid email format" },
				{ status: 400 }
			);
		}

		await connectDB();
		const user = await User.findOne({ userId });
		if (!user) {
			return NextResponse.json(
				{ ok: false, error: "User not found" },
				{ status: 404 }
			);
		}

		if (nextEmail && nextEmail !== user.email) {
			const conflict = await User.findOne({
				_id: { $ne: user._id },
				email: new RegExp(`^${nextEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
			}).select("_id");

			if (conflict) {
				return NextResponse.json(
					{ ok: false, error: "Email is already used by another account" },
					{ status: 409 }
				);
			}

			user.email = nextEmail;
		}

		if (nextName !== undefined) {
			user.name = nextName;
		}

		if (nextBirthDateTime !== undefined && nextBirthDateTime !== null) {
			const parsedDate = new Date(nextBirthDateTime);
			if (Number.isNaN(parsedDate.getTime())) {
				return NextResponse.json(
					{ ok: false, error: "Invalid birth date/time" },
					{ status: 400 }
				);
			}
			user.birthDateTime = parsedDate;
			user.birthdayProvided = true;
		}

		if (nextWeeklyAdviceEnabled !== undefined) {
			user.weeklyAdviceEnabled = nextWeeklyAdviceEnabled;
		}

		user.updatedAt = new Date();
		await user.save();

		return NextResponse.json({ ok: true, profile: toProfile(user) });
	} catch (error) {
		return NextResponse.json(
			{ ok: false, error: error.message || "Failed to update profile" },
			{ status: 500 }
		);
	}
}
