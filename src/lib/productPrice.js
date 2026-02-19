/**
 * Get display price and symbol for a product based on user's region (中/港/台).
 * Uses priceCNY, priceHKD, priceTWD when set; otherwise falls back to product.price + product.currency.
 */

import { getRegionConfig } from "@/config/regions";

const CURRENCY_SYMBOLS = { HKD: "HK$", CNY: "¥", USD: "$", TWD: "NT$" };

/**
 * @param {object} product - Product object (may have priceCNY, priceHKD, priceTWD, price, currency)
 * @param {string} region - "china" | "hongkong" | "taiwan"
 * @returns {{ price: number, symbol: string, discountedPrice?: number }}
 */
export function getProductDisplayPrice(product, region) {
	if (!product) return { price: 0, symbol: "HK$", discountedPrice: 0 };

	const config = getRegionConfig(region || "hongkong");
	let price =
		region === "china"
			? product.priceCNY ?? product.price
			: region === "hongkong"
				? product.priceHKD ?? product.price
				: product.priceTWD ?? product.price;

	const symbol = config?.symbol || CURRENCY_SYMBOLS[product.currency] || "HK$";
	const discount = product.discount?.percentage || 0;
	const discountedPrice =
		discount > 0 ? price * (1 - discount / 100) : price;

	return { price, symbol, discountedPrice };
}
