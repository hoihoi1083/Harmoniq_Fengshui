import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
	genSuccessData,
	genUnAuthData,
	genErrorData,
} from "../utils/gen-res-data";
import { getUserInfo } from "@/lib/session";

// Required for static export with Capacitor
export const dynamic = "force-static";

export async function POST(request) {
	// 🔥 MOBILE FIX: Don't require auth for payment verification
	// The payment session ID itself is sufficient validation
	// This allows mobile users to verify payments without NextAuth session
	const userInfo = await getUserInfo();
	console.log("📱 verify-payment: userInfo=", !!userInfo);

	try {
		const body = await request.json();
		const { sessionId } = body;

		if (!sessionId) {
			return NextResponse.json(genErrorData("Session ID is required"));
		}

		// Retrieve the checkout session from Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		// Check if payment was successful
		if (session.payment_status === "paid") {
			return NextResponse.json(
				genSuccessData({
					payment_status: session.payment_status,
					customer_email: session.customer_details?.email,
					amount_total: session.amount_total,
					currency: session.currency,
					metadata: session.metadata,
				})
			);
		} else {
			return NextResponse.json(genErrorData("Payment not completed"));
		}
	} catch (err) {
		return NextResponse.json(genErrorData("驗證支付失敗: " + err.message));
	}
}
