/**
 * Regional Pricing Utility
 * Automatically selects the correct Stripe Price ID based on user's locale/region
 */

/**
 * Get the appropriate price ID based on locale and payment type
 * @param {string} locale - Current locale (zh-CN, zh-TW)
 * @param {string} paymentType - Type of payment (fengshui, life, fortune, couple, wealth, relationship, health, career)
 * @param {string} region - Optional region override (china, hongkong, taiwan)
 * @returns {string} - Appropriate Stripe price ID
 */
export function getRegionalPriceId(locale, paymentType, region = null) {
	// Determine currency based on region or locale
	let currency;
	if (region) {
		// If region is explicitly provided, use it
		currency =
			region === "china" ? "CNY" : region === "taiwan" ? "NTD" : "HKD";
	} else {
		// Fallback to locale-based detection
		currency = locale === "zh-CN" ? "CNY" : "HKD";
	}

	// Price ID mapping based on currency and payment type
	const priceIdMap = {
		CNY: {
			fengshui: process.env.PRICE_ID2_CNY, // ¥188 fengshui
			life: process.env.PRICE_ID4_CNY, // ¥88 life
			fortune: process.env.PRICE_ID5_CNY, // ¥38 fortune/wealth
			wealth: process.env.PRICE_ID5_CNY, // ¥38 wealth
			relationship: process.env.PRICE_ID7_CNY, // ¥38 relationship
			couple: process.env.PRICE_ID6_CNY, // ¥88 couple
			health: process.env.PRICE_ID8_CNY, // ¥38 health
			career: process.env.PRICE_ID9_CNY, // ¥38 career
		},
		HKD: {
			fengshui: process.env.PRICE_ID2_HKD, // HK$188 fengshui
			life: process.env.PRICE_ID4_HKD, // HK$88 life
			fortune: process.env.PRICE_ID5_HKD, // HK$38 fortune/wealth
			wealth: process.env.PRICE_ID5_HKD, // HK$38 wealth
			relationship: process.env.PRICE_ID7_HKD, // HK$38 relationship
			couple: process.env.PRICE_ID6_HKD, // HK$88 couple
			health: process.env.PRICE_ID8_HKD, // HK$38 health
			career: process.env.PRICE_ID9_HKD, // HK$38 career
		},
		NTD: {
			fengshui: process.env.PRICE_ID2_NTD, // NT$740 fengshui (using same as HKD for now)
			life: process.env.PRICE_ID4_NTD, // NT$340 life
			fortune: process.env.PRICE_ID5_NTD, // NT$150 fortune/wealth
			wealth: process.env.PRICE_ID5_NTD, // NT$150 wealth
			relationship: process.env.PRICE_ID7_NTD, // NT$150 relationship
			couple: process.env.PRICE_ID6_NTD, // NT$340 couple
			health: process.env.PRICE_ID8_NTD, // NT$150 health
			career: process.env.PRICE_ID9_NTD, // NT$150 career
		},
	};

	const priceId = priceIdMap[currency]?.[paymentType];

	if (!priceId) {
		console.error(
			`❌ No price ID found for currency: ${currency}, paymentType: ${paymentType}`
		);
		// Fallback to HKD if price not found
		return priceIdMap.HKD[paymentType] || process.env.PRICE_ID2_HKD;
	}

	console.log(
		`✅ Selected price ID: ${priceId} for ${currency} ${paymentType}`
	);
	return priceId;
}

/**
 * Extract locale and region from request headers
 * @param {Request} request - Next.js request object
 * @returns {object} - Detected locale and region
 */
export function getLocaleAndRegionFromRequest(request) {
	// Method 1: Check the pathname for locale
	const url = new URL(request.url);
	const pathSegments = url.pathname.split("/");

	let locale = "zh-TW"; // Default
	if (pathSegments[1] === "zh-CN") {
		locale = "zh-CN";
	} else if (pathSegments[1] === "zh-TW") {
		locale = "zh-TW";
	}

	// Method 2: Check Accept-Language header
	const acceptLanguage = request.headers.get("accept-language") || "";
	if (acceptLanguage.includes("zh-CN")) {
		locale = "zh-CN";
	}

	// Method 3: Check referer URL
	const referer = request.headers.get("referer") || "";
	if (referer.includes("/zh-CN/")) {
		locale = "zh-CN";
	}

	// Method 4: Check for region in headers or URL params
	const regionHeader = request.headers.get("x-user-region");
	const urlParams = new URLSearchParams(url.search);
	const regionParam = urlParams.get("region");

	// Determine region based on various sources
	let region = regionParam || regionHeader;

	// If no explicit region, infer from locale
	if (!region) {
		if (locale === "zh-CN") {
			region = "china";
		} else if (locale === "zh-TW") {
			region = "hongkong"; // Default zh-TW to Hong Kong for HKD pricing
		} else {
			region = "hongkong"; // Default fallback
		}
	}

	return { locale, region };
}

/**
 * Extract locale from request headers (backward compatibility)
 * @param {Request} request - Next.js request object
 * @returns {string} - Detected locale (zh-CN or zh-TW)
 */
export function getLocaleFromRequest(request) {
	const { locale } = getLocaleAndRegionFromRequest(request);
	return locale;
}

/**
 * Get currency symbol based on locale and region
 * @param {string} locale - Current locale
 * @param {string} region - Current region (china, hongkong, taiwan)
 * @returns {string} - Currency symbol
 */
export function getCurrencySymbol(locale, region = null) {
	if (region) {
		switch (region) {
			case "china":
				return "¥";
			case "taiwan":
				return "NT$";
			case "hongkong":
			default:
				return "HK$";
		}
	}
	// Fallback to locale-based
	return locale === "zh-CN" ? "¥" : "HK$";
}

/**
 * Get currency code based on locale and region
 * @param {string} locale - Current locale
 * @param {string} region - Current region (china, hongkong, taiwan)
 * @returns {string} - Currency code
 */
export function getCurrencyCode(locale, region = null) {
	if (region) {
		switch (region) {
			case "china":
				return "CNY";
			case "taiwan":
				return "TWD";
			case "hongkong":
			default:
				return "HKD";
		}
	}
	// Fallback to locale-based
	return locale === "zh-CN" ? "CNY" : "HKD";
}

/**
 * Get display prices based on locale and region
 * @param {string} locale - Current locale
 * @param {string} region - Current region (china, hongkong, taiwan)
 * @returns {object} - Price information for display
 */
export function getDisplayPrices(locale, region = null) {
	const currencyCode = getCurrencyCode(locale, region);
	const symbol = getCurrencySymbol(locale, region);

	const prices = {
		CNY: {
			fengshui: { original: 388, discount: 188 },
			life: { original: 168, discount: 88 },
			fortune: { original: 88, discount: 38 },
			wealth: { original: 88, discount: 38 },
			relationship: { original: 88, discount: 38 },
			couple: { original: 188, discount: 88 },
			health: { original: 88, discount: 38 },
			career: { original: 88, discount: 38 },
		},
		HKD: {
			fengshui: { original: 388, discount: 188 },
			life: { original: 168, discount: 88 },
			fortune: { original: 88, discount: 38 },
			wealth: { original: 88, discount: 38 },
			relationship: { original: 88, discount: 38 },
			couple: { original: 188, discount: 88 },
			health: { original: 88, discount: 38 },
			career: { original: 88, discount: 38 },
		},
		TWD: {
			fengshui: { original: 1540, discount: 740 }, // Approximate conversion
			life: { original: 660, discount: 340 },
			fortune: { original: 300, discount: 150 },
			wealth: { original: 300, discount: 150 },
			relationship: { original: 300, discount: 150 },
			couple: { original: 680, discount: 340 },
			health: { original: 300, discount: 150 },
			career: { original: 300, discount: 150 },
		},
	};

	return {
		currency: currencyCode,
		symbol,
		prices: prices[currencyCode] || prices.HKD,
	};
}

export default {
	getRegionalPriceId,
	getLocaleFromRequest,
	getLocaleAndRegionFromRequest,
	getCurrencySymbol,
	getCurrencyCode,
	getDisplayPrices,
};
