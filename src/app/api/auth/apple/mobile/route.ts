import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

// Apple JWKS client for verifying Apple ID tokens
const client = jwksClient({
	jwksUri: "https://appleid.apple.com/auth/keys",
	cache: true,
	cacheMaxAge: 86400000, // 24 hours
});

function getApplePublicKey(header: any, callback: any) {
	client.getSigningKey(header.kid, (err, key) => {
		if (err) {
			callback(err);
		} else {
			const signingKey = key?.getPublicKey();
			callback(null, signingKey);
		}
	});
}

/**
 * Mobile Apple Authentication Endpoint
 * Receives identity token from Apple Sign In SDK on mobile devices
 * Verifies token and creates/returns user session
 */

// Required for static export with Capacitor
export const dynamic = 'force-static';

export async function POST(request: Request) {
	try {
		const { identityToken, user, email, fullName, authorizationCode } =
			await request.json();

		if (!identityToken) {
			return NextResponse.json(
				{
					success: false,
					error: "Identity token is required",
				},
				{ status: 400 }
			);
		}

		console.log("🍎 Mobile Apple Auth: Verifying identity token...");

		// Verify Apple identity token
		const decoded: any = await new Promise((resolve, reject) => {
			jwt.verify(
				identityToken,
				getApplePublicKey,
				{
					issuer: "https://appleid.apple.com",
					audience: process.env.APPLE_ID,
				},
				(err, decoded) => {
					if (err) {
						console.error("❌ Apple token verification failed:", err);
						reject(err);
					} else {
						resolve(decoded);
					}
				}
			);
		});

		if (!decoded || !decoded.sub) {
			console.error("❌ Invalid Apple token payload");
			return NextResponse.json(
				{ success: false, error: "Invalid Apple token" },
				{ status: 401 }
			);
		}

		console.log("✅ Apple token verified for user:", decoded.sub);

		await dbConnect();

		// Apple user identifier
		const appleUserId = decoded.sub;
		const userEmail = email || decoded.email;

		// Find or create user
		let dbUser = await User.findOne({
			$or: [{ appleUserId: appleUserId }, { email: userEmail }],
		});

		if (!dbUser) {
			console.log("👤 Creating new Apple user:", userEmail || appleUserId);

			// Construct user name from fullName object
			let userName = "User";
			if (fullName) {
				const givenName = fullName.givenName || "";
				const familyName = fullName.familyName || "";
				userName = `${givenName} ${familyName}`.trim() || userName;
			} else if (userEmail) {
				userName = userEmail.split("@")[0];
			}

			dbUser = await User.create({
				email: userEmail,
				name: userName,
				provider: "apple",
				appleUserId: appleUserId,
				userId: userEmail || appleUserId,
			});
		} else {
			// Update last login
			dbUser.lastLoginAt = new Date();
			// Update Apple user ID if not set
			if (!dbUser.appleUserId) {
				dbUser.appleUserId = appleUserId;
			}
			await dbUser.save();
		}

		// Generate JWT for mobile app
		const accessToken = jwt.sign(
			{
				userId: dbUser._id.toString(),
				email: dbUser.email,
				provider: "apple",
			},
			process.env.NEXTAUTH_SECRET as string,
			{ expiresIn: "30d" } // 30 days for mobile
		);

		console.log("🎉 Mobile Apple Auth successful!");

		return NextResponse.json({
			success: true,
			accessToken,
			user: {
				id: dbUser._id.toString(),
				email: dbUser.email,
				name: dbUser.name,
				userId: dbUser.userId,
			},
		});
	} catch (error: any) {
		console.error("❌ Apple Mobile Auth Error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Authentication failed",
				message: error.message,
			},
			{ status: 500 }
		);
	}
}
