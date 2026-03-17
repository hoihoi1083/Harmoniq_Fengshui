/**
 * Report products (sold via report-preview only). Hidden from shop listing.
 * Map: report type -> Product.productId
 */
export const REPORT_PRODUCT_ID_BY_TYPE = {
	fengshui: "PROD-1773654077760-p5vrxxf68",
	life: "PROD-1773654009332-fdzzwzj5k",
	relationship: "PROD-1773653942040-vkyyg3odg",
	couple: "PROD-1773653893920-vf0knv1on",
	wealth: "PROD-1773652721585-zkqex7z3b",
	health: "PROD-1773653711364-csmw0kdk9",
	career: "PROD-1773653789018-15wz4fbmp",
};

export const REPORT_PRODUCT_IDS = Object.values(REPORT_PRODUCT_ID_BY_TYPE);
