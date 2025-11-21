import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
	getRegionalPriceId,
	getLocaleAndRegionFromRequest,
} from "@/utils/regionalPricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
	try {
		const body = await request.json();
		const {
			locale: requestLocale,
			region: requestRegion, // 🔥 Add region support
			specificProblem,
			concern,
			fromChat,
		} = body;

		console.log("🔍 Payment-couple API received data:", {
			requestLocale,
			requestRegion,
			specificProblem,
			concern,
			fromChat,
		});

		// Detect user's locale and region (prioritize request body, then headers)
		const { locale: detectedLocale, region: detectedRegion } =
			requestLocale || requestRegion
				? { locale: requestLocale, region: requestRegion }
				: getLocaleAndRegionFromRequest(request);

		console.log(
			`🌍 Couple payment - Detected locale: ${detectedLocale}, region: ${detectedRegion}`
		);

		// Get the appropriate price ID for couple based on locale and region
		const priceId = getRegionalPriceId(
			detectedLocale,
			"couple",
			detectedRegion
		);
		console.log(
			`💰 Couple payment - Using price ID: ${priceId} for couple ${detectedLocale} (${detectedRegion})`
		);

		// Build success URL with chat context if available
		let successUrl = `${process.env.NEXTAUTH_URL}/${detectedLocale}/success?session_id={CHECKOUT_SESSION_ID}&type=couple`;

		if (fromChat && (specificProblem || concern)) {
			if (specificProblem) {
				successUrl += `&specificProblem=${encodeURIComponent(specificProblem)}`;
			}
			if (concern) {
				successUrl += `&concern=${encodeURIComponent(concern)}`;
			}
			successUrl += `&fromChat=true`;
		}

		// Create Stripe checkout session for couple analysis with regional pricing
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price: priceId, // Use regional price ID instead of hardcoded PRICE_ID6
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: successUrl,
			cancel_url: `${process.env.NEXTAUTH_URL}/${detectedLocale}/price`,
			// 🎨 Custom branding and appearance
			custom_text: {
				submit: {
					message:
						detectedLocale === "zh-CN"
							? "完成付款后，您将收到专属的情侣合盘分析报告"
							: "完成付款後，您將收到專屬的情侶合盤分析報告",
				},
			},
			// 🔥 REMOVED locale parameter to prevent Stripe automatic currency conversion
			// locale: detectedLocale === "zh-CN" ? "zh" : "zh-TW", // This causes automatic currency conversion!
			billing_address_collection: "auto",
			customer_creation: "always",
			// 🎨 Payment page customization
			ui_mode: "hosted", // or "embedded" for more control
			metadata: {
				paymentType: "couple",
				locale: detectedLocale, // Use detected locale
				...(fromChat &&
					specificProblem && {
						specificProblem: specificProblem,
						fromChat: "true",
					}),
				...(fromChat &&
					concern && {
						concern: concern,
					}),
			},
		});

		return NextResponse.json({ sessionId: session.id });
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json(
			{ error: "Error creating checkout session" },
			{ status: 500 }
		);
	}
}
