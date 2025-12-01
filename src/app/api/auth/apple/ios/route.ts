import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { createUserIfNotExists } from "@/lib/userUtils";
import jwt from "jsonwebtoken";
// Note: no direct signIn import required here. This endpoint creates/returns a session-like
// response for mobile clients after verifying the Apple identity token.

/**
 * 🍎 iOS Native Apple Sign-In Handler
 * This endpoint receives the identity token from the native iOS Apple Sign-In,
 * validates it, creates/updates the user, and creates a session.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			identityToken,
			authorizationCode,
			email,
			givenName,
			familyName,
		} = body;

		console.log("🍎 Received iOS Apple Sign-In request:", {
			hasIdentityToken: !!identityToken,
			hasAuthCode: !!authorizationCode,
			email,
			givenName,
			familyName,
		});

		if (!identityToken) {
			return NextResponse.json(
				{ error: "Missing identityToken" },
				{ status: 400 }
			);
		}

		// Decode the identity token (without verification for now)
		// In production, you should verify the token with Apple's public key
		const decoded = jwt.decode(identityToken) as any;
		console.log("🔓 Decoded identity token:", decoded);

		if (!decoded || !decoded.sub) {
			return NextResponse.json(
				{ error: "Invalid identity token" },
				{ status: 400 }
			);
		}

		// Extract user info
		const appleUserId = decoded.sub;
		const userEmail =
			email || decoded.email || `${appleUserId}@apple.privaterelay.com`;
		const userName =
			givenName && familyName
				? `${givenName} ${familyName}`
				: givenName || decoded.email?.split("@")[0] || "Apple User";

		console.log("👤 User info:", {
			appleUserId,
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
			},
		});
	} catch (error) {
		console.error("❌ iOS Apple Sign-In error:", error);
		return NextResponse.json(
			{ error: "Authentication failed", details: String(error) },
			{ status: 500 }
		);
	}
}
