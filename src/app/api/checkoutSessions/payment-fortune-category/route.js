import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
	genSuccessData,
	genUnAuthData,
	genErrorData,
} from "../../utils/gen-res-data";
import { stripe } from "@/lib/stripe";
import { getUserInfo } from "@/lib/session";

export async function POST(request) {
	const userInfo = await getUserInfo();
	if (userInfo == null) return NextResponse.json(genUnAuthData());

	try {
		const headersList = await headers();
		const origin = headersList.get("origin");

		// Get request body
		const body = await request.json();
		const {
			concernType,
			locale: requestLocale,
			region: requestRegion,
			quantity = 1,
			fromChat,
			specificProblem,
		} = body;

		if (!concernType) {
			return NextResponse.json(genErrorData("Concern type is required"));
		}

		console.log(`🌍 Fortune category payment - Request:`, {
			concernType,
			requestLocale,
			requestRegion,
			quantity,
			fromChat: !!fromChat,
		});

		// Map concern types to price IDs based on locale and region
		const priceIdMap = {
			// Wealth/Financial
			financial: {
				"zh-CN": process.env.PRICE_ID5_CNY, // ¥38 wealth
				"zh-TW": {
					hongkong: process.env.PRICE_ID5_HKD, // HK$38 wealth
					taiwan: process.env.PRICE_ID5_NTD, // NT$150 wealth
					default: process.env.PRICE_ID5_HKD, // Default to HKD
				},
			},
			wealth: {
				"zh-CN": process.env.PRICE_ID5_CNY, // ¥38 wealth
				"zh-TW": {
					hongkong: process.env.PRICE_ID5_HKD, // HK$38 wealth
					taiwan: process.env.PRICE_ID5_NTD, // NT$150 wealth
					default: process.env.PRICE_ID5_HKD, // Default to HKD
				},
			},
			// Relationship/Love
			love: {
				"zh-CN": process.env.PRICE_ID7_CNY, // ¥38 relationship
				"zh-TW": {
					hongkong: process.env.PRICE_ID7_HKD, // HK$38 relationship
					taiwan: process.env.PRICE_ID7_NTD, // NT$150 relationship
					default: process.env.PRICE_ID7_HKD, // Default to HKD
				},
			},
			relationship: {
				"zh-CN": process.env.PRICE_ID7_CNY, // ¥38 relationship
				"zh-TW": {
					hongkong: process.env.PRICE_ID7_HKD, // HK$38 relationship
					taiwan: process.env.PRICE_ID7_NTD, // NT$150 relationship
					default: process.env.PRICE_ID7_HKD, // Default to HKD
				},
			},
			// Health
			health: {
				"zh-CN": process.env.PRICE_ID8_CNY, // ¥38 health
				"zh-TW": {
					hongkong: process.env.PRICE_ID8_HKD, // HK$38 health
					taiwan: process.env.PRICE_ID8_NTD, // NT$150 health
					default: process.env.PRICE_ID8_HKD, // Default to HKD
				},
			},
			// Career
			career: {
				"zh-CN": process.env.PRICE_ID9_CNY, // ¥38 career
				"zh-TW": {
					hongkong: process.env.PRICE_ID9_HKD, // HK$38 career
					taiwan: process.env.PRICE_ID9_NTD, // NT$150 career
					default: process.env.PRICE_ID9_HKD, // Default to HKD
				},
			},
		};

		// Get the appropriate price ID
		const priceIds = priceIdMap[concernType];
		if (!priceIds) {
			return NextResponse.json(
				genErrorData(`Unsupported concern type: ${concernType}`)
			);
		}

		// Determine locale - default to zh-TW if not specified
		const locale = requestLocale || "zh-TW";

		// Get region from multiple sources (request body has highest priority)
		const requestHeaders = await headers();
		const url = new URL(request.url);
		const regionParam = url.searchParams.get("region");
		const regionHeader = requestHeaders.get("x-user-region");
		const region =
			requestRegion || regionParam || regionHeader || "hongkong"; // Default to hongkong

		let priceId;
		if (locale === "zh-CN") {
			priceId = priceIds["zh-CN"];
		} else {
			// For zh-TW, check if we have region-specific pricing
			const zhTwPrices = priceIds["zh-TW"];
			if (typeof zhTwPrices === "object" && !Array.isArray(zhTwPrices)) {
				// Region-specific pricing available
				priceId = zhTwPrices[region] || zhTwPrices.default;
			} else {
				// Simple pricing (backward compatibility)
				priceId = zhTwPrices;
			}
		}

		if (!priceId) {
			console.error(
				`No price ID found for concern: ${concernType}, locale: ${locale}`
			);
			return NextResponse.json(
				genErrorData(
					`Price ID not configured for ${concernType} in ${locale}`
				)
			);
		}

		console.log(
			`💰 Using price ID: ${priceId} for concern: ${concernType}, locale: ${locale}, region: ${region}`
		);

		// Build success URL with locale and context
		let successUrl = `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}&type=fortune&concern=${concernType}`;

		if (fromChat && specificProblem) {
			successUrl += `&specificProblem=${encodeURIComponent(specificProblem)}&fromChat=true`;
		}

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price: priceId,
					quantity: parseInt(quantity),
				},
			],
			mode: "payment",
			allow_promotion_codes: true,
			success_url: successUrl,
			cancel_url: `${origin}/${locale}/price?payment=cancelled`,
			// 🔥 REMOVED locale parameter to prevent Stripe automatic currency conversion
			// locale: locale === "zh-CN" ? "zh" : "zh-TW", // This causes automatic currency conversion!
			custom_text: {
				submit: {
					message:
						locale === "zh-CN"
							? "完成付款后，您将收到专属的运势分析报告"
							: "完成付款後，您將收到專屬的運勢分析報告",
				},
			},
			metadata: {
				userId: userInfo.userId || userInfo.id,
				paymentType: "fortune",
				concern: concernType,
				locale: locale,
				quantity: String(quantity),
				...(fromChat &&
					specificProblem && {
						specificProblem: specificProblem,
						fromChat: "true",
					}),
			},
		});

		console.log("Fortune category payment session created:", {
			sessionId: session.id,
			hasUrl: !!session.url,
			concern: concernType,
			locale: locale,
		});

		return NextResponse.json(genSuccessData(session));
	} catch (err) {
		console.error("Fortune category payment error:", err);
		return NextResponse.json(genErrorData("Payment error: " + err.message));
	}
}
