import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
	genSuccessData,
	genUnAuthData,
	genErrorData,
} from "../../utils/gen-res-data";
import { stripe } from "@/lib/stripe";
import { getUserInfo } from "@/lib/session";
import {
	getRegionalPriceId,
	getLocaleAndRegionFromRequest,
} from "@/utils/regionalPricing";

export async function POST(request) {
	// Get request body first
	const body = await request.json();

	// 🔥 MOBILE FIX: Read mobile flag from request body
	const { isMobile, userEmail, userId } = body;
	console.log("[payment4] 📱 Mobile detection from body:", {
		isMobile,
		userEmail,
		userId,
	});

	// Check if it's a mobile request
	const isMobileRequest = isMobile === true || !!(userEmail || userId);
	console.log("[payment4] 🔍 Is mobile request:", isMobileRequest);

	// Try to get user info from NextAuth first
	let userInfo = await getUserInfo();

	// If no NextAuth session but mobile info exists in body, create user info object
	if (!userInfo && (userEmail || userId)) {
		console.log("📱 Using mobile session from body:", {
			userEmail,
			userId,
		});
		userInfo = {
			email: userEmail,
			userId: userId || userEmail,
		};
	}

	if (userInfo == null) return NextResponse.json(genUnAuthData());

	try {
		const headersList = await headers();
		const origin = headersList.get("origin");

		// Get request body parameters
		const quantity = Number(body.quantity) || 1;
		const requestLocale = body.locale;
		const requestRegion = body.region;

		// Detect user's locale and region to determine pricing
		const { locale: headerLocale, region: headerRegion } =
			getLocaleAndRegionFromRequest(request);

		// Use request body values if provided, otherwise fall back to headers
		const locale = requestLocale || headerLocale;
		const region = requestRegion || headerRegion;

		console.log(
			`🌍 Life payment - Detected locale: ${locale}, region: ${region}`
		);
		console.log(
			`🔍 Payment4 - Request body locale: ${requestLocale}, region: ${requestRegion}`
		);
		console.log(
			`🔍 Payment4 - Headers locale: ${headerLocale}, region: ${headerRegion}`
		);

		// Get the appropriate price ID for life based on locale and region
		const priceId = getRegionalPriceId(locale, "life", region);
		console.log(`💰 Using price ID: ${priceId} for life ${locale}`);

		console.log("Payment4 API - Regional pricing:", {
			locale: locale,
			priceId: priceId,
			hasPrice: !!priceId,
		});

		console.log("About to create Stripe session with regional pricing:", {
			price: priceId,
			quantity,
			origin,
			userId: userInfo.userId || userInfo.id,
			locale: locale,
		});

		// 📱 MOBILE FIX: Use mobile flag from request body for success URL
		let successUrl = `${origin}/success?session_id={CHECKOUT_SESSION_ID}&type=expert88`;

		if (isMobileRequest) {
			successUrl += "&mobile=true";
			console.log(
				"📱 Adding mobile=true to success URL for mobile request"
			);
		}

		// Create Checkout Sessions for $88 Expert Card using regional price ID
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: priceId, // Use regional price ID instead of hardcoded PRICE_ID4
					quantity,
				},
			],
			mode: "payment",
			allow_promotion_codes: true,
			success_url: successUrl,
			cancel_url: `${origin}/price?payment=cancelled`,
			metadata: {
				userId: userInfo.userId || userInfo.id,
				quantity: String(quantity),
				paymentType: "expert88",
				locale: locale,
			},
		});

		console.log("Expert88 Payment Session Created:", {
			hasUrl: !!session.url,
			url: session.url,
			id: session.id,
			payment_status: session.payment_status,
			sessionKeys: Object.keys(session),
		});

		const responseData = genSuccessData(session);
		console.log("Response structure:", {
			hasResponseData: !!responseData,
			hasDataProperty: !!responseData.data,
			hasUrlInData: !!responseData.data?.url,
			responseKeys: Object.keys(responseData),
			dataKeys: responseData.data
				? Object.keys(responseData.data)
				: "no data property",
		});

		return NextResponse.json(responseData);
	} catch (err) {
		console.log("Payment4 API Error:", err.message);

		// Provide more specific error messages
		let errorMessage = "專家版支付錯誤: " + err.message;
		if (err.message.includes("total amount due must add up to at least")) {
			errorMessage = "付款金額設定錯誤，請聯絡客服";
		}

		return NextResponse.json(genErrorData(errorMessage));
	}
}
