/**
 * Get product name in the correct locale (Simplified vs Traditional Chinese).
 * Admin stores name.zh_CN and name.zh_TW; use zh_CN when locale is zh-CN.
 */
export function getProductName(product, locale) {
	if (!product?.name) return "";
	const isCN = locale === "zh-CN";
	return (isCN ? product.name.zh_CN : product.name.zh_TW) ?? product.name.zh_TW ?? product.name.zh_CN ?? "";
}

/**
 * Get product description in the correct locale.
 */
export function getProductDescription(product, locale) {
	if (!product?.description) return "";
	const isCN = locale === "zh-CN";
	return (isCN ? product.description.zh_CN : product.description.zh_TW) ?? product.description.zh_TW ?? product.description.zh_CN ?? "";
}
