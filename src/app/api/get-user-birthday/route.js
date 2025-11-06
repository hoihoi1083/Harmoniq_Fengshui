import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import SmartUserIntent from "@/models/SmartUserIntent";

export async function GET(request) {
	try {
		// Get user session
		const session = await auth();

		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Not authenticated" },
				{ status: 401 }
			);
		}

		// Connect to database
		await connectDB();

		// Find user by email
		const user = await User.findOne({ userId: session.user.email });

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Extract birthday and time from birthDateTime
		let birthday = "";
		let birthTime = "";
		let gender = user.gender || "";
		let birthdaySource = "user"; // Track where birthday comes from

		// PRIORITY 1: Check SmartUserIntent from chatbox first (most recent)
		const smartUserIntent = await SmartUserIntent.findOne({
			userId: session.user.email,
			userBirthday: { $exists: true, $ne: null },
			birthdayConfirmed: true,
		}).sort({ updatedAt: -1 }); // Get the most recently updated confirmed birthday

		if (smartUserIntent && smartUserIntent.userBirthday) {
			const birthDate = new Date(smartUserIntent.userBirthday);

			// Format birthday as YYYY-MM-DD
			const year = birthDate.getFullYear();
			const month = String(birthDate.getMonth() + 1).padStart(2, "0");
			const day = String(birthDate.getDate()).padStart(2, "0");
			birthday = `${year}-${month}-${day}`;

			// DON'T prefill birth time from chatbox - let user enter it manually
			// Chatbox only collects birthday, not birth time
			birthTime = "";

			// Get gender from SmartUserIntent if not in User
			if (!gender && smartUserIntent.userGender) {
				gender = smartUserIntent.userGender;
			}

			birthdaySource = "chatbox";
			console.log(
				"✅ Retrieved birthday from SmartUserIntent (chatbox):",
				birthday,
				"(No birth time - let user enter manually)"
			);
		}
		// PRIORITY 2: Fallback to User collection if no chatbox data
		else if (user.birthDateTime) {
			const birthDate = new Date(user.birthDateTime);

			// Format birthday as YYYY-MM-DD
			const year = birthDate.getFullYear();
			const month = String(birthDate.getMonth() + 1).padStart(2, "0");
			const day = String(birthDate.getDate()).padStart(2, "0");
			birthday = `${year}-${month}-${day}`;

			// Format birth time as HH:MM
			const hours = String(birthDate.getHours()).padStart(2, "0");
			const minutes = String(birthDate.getMinutes()).padStart(2, "0");
			birthTime = `${hours}:${minutes}`;

			console.log(
				"ℹ️ Retrieved birthday from User collection:",
				birthday,
				birthTime
			);
		}

		return NextResponse.json({
			success: true,
			birthday,
			birthTime,
			gender,
			source: birthdaySource, // Let frontend know where data came from
		});
	} catch (error) {
		console.error("Error fetching user birthday:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user data" },
			{ status: 500 }
		);
	}
}
