import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import dbConnect from "@/lib/mongoose";
import { createUserIfNotExists } from "@/lib/userUtils";

/**
 * 🔵 iOS/Android Native Google Sign-In Handler
 * This endpoint receives the ID token from the native Google Sign-In,
 * validates it, creates/updates the user, and returns user info for session.
 */

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { idToken, email, name, imageUrl } = body;

		console.log("🔵 Received native Google Sign-In request:", {
			hasIdToken: !!idToken,
			email,
			name,
		});

		if (!idToken) {
			return NextResponse.json(
				{ error: "Missing idToken" },
				{ status: 400 }
			);
		}

		// Verify the ID token with Google using iOS client ID
		const client = new OAuth2Client(
			process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID
		);

		let payload;
		try {
			const ticket = await client.verifyIdToken({
				idToken,
				audience: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID,
			});
			payload = ticket.getPayload();
			console.log("✅ Google ID token verified:", {
				sub: payload?.sub,
				email: payload?.email,
			});
		} catch (error) {
			console.error("❌ Token verification failed:", error);
			return NextResponse.json(
				{ error: "Invalid Google ID token" },
				{ status: 401 }
			);
		}

		if (!payload || !payload.sub) {
			return NextResponse.json(
				{ error: "Invalid token payload" },
				{ status: 400 }
			);
		}

		// Extract user info
		const googleUserId = payload.sub;
		const userEmail = email || payload.email || `${googleUserId}@gmail.com`;
		const userName = name || payload.name || "Google User";

		console.log("👤 User info:", {
			googleUserId,
			userEmail,
			userName,
		});

		// Connect to database and create/update user
		await dbConnect();
		const user = await createUserIfNotExists(userEmail, userEmail);

		// Return success with user info for client-side session creation
		return NextResponse.json({
			success: true,
			user: {
				id: user._id.toString(),
				email: userEmail,
				name: userName,
				userId: userEmail,
				image: imageUrl || payload.picture,
			},
		});
	} catch (error) {
		console.error("❌ Native Google Sign-In error:", error);
		return NextResponse.json(
			{ error: "Authentication failed", details: String(error) },
			{ status: 500 }
		);
	}
}
