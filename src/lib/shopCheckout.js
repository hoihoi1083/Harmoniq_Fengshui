/**
 * Shop checkout helpers: region → Stripe currency and product price.
 * Used by create-checkout-session API; exported for unit tests.
 */

/**
 * Map user region to Stripe currency (lowercase). All line items must use the same currency.
 * @param {string} region - "china" | "hongkong" | "taiwan"
 * @returns {"cny" | "hkd" | "twd"}
 */
export function getStripeCurrencyForRegion(region) {
	if (region === "china") return "cny";
	if (region === "taiwan") return "twd";
	return "hkd"; // hongkong or default
}

/**
 * Get price for a product in the given region (number in main unit, e.g. 88 for HK$88).
 * @param {object} product - Product with priceCNY, priceHKD, priceTWD, price
 * @param {string} region - "china" | "hongkong" | "taiwan"
 * @returns {number}
 */
export function getPriceForRegion(product, region) {
	if (!product) return 0;
	if (region === "china") return product.priceCNY ?? product.price;
	if (region === "taiwan") return product.priceTWD ?? product.price;
	return product.priceHKD ?? product.price;
}
