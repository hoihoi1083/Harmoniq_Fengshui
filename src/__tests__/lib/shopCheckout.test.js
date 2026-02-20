import {
	getStripeCurrencyForRegion,
	getPriceForRegion,
} from "@/lib/shopCheckout";

describe("shopCheckout", () => {
	describe("getStripeCurrencyForRegion", () => {
		it("returns cny for china", () => {
			expect(getStripeCurrencyForRegion("china")).toBe("cny");
		});

		it("returns twd for taiwan", () => {
			expect(getStripeCurrencyForRegion("taiwan")).toBe("twd");
		});

		it("returns hkd for hongkong", () => {
			expect(getStripeCurrencyForRegion("hongkong")).toBe("hkd");
		});

		it("returns hkd for undefined or other (default)", () => {
			expect(getStripeCurrencyForRegion(undefined)).toBe("hkd");
			expect(getStripeCurrencyForRegion("")).toBe("hkd");
		});
	});

	describe("getPriceForRegion", () => {
		const product = {
			price: 100,
			priceCNY: 88,
			priceHKD: 100,
			priceTWD: 380,
		};

		it("returns priceCNY for china", () => {
			expect(getPriceForRegion(product, "china")).toBe(88);
		});

		it("returns priceHKD for hongkong", () => {
			expect(getPriceForRegion(product, "hongkong")).toBe(100);
		});

		it("returns priceTWD for taiwan", () => {
			expect(getPriceForRegion(product, "taiwan")).toBe(380);
		});

		it("falls back to price when region price is missing", () => {
			const p = { price: 50 };
			expect(getPriceForRegion(p, "china")).toBe(50);
			expect(getPriceForRegion(p, "hongkong")).toBe(50);
			expect(getPriceForRegion(p, "taiwan")).toBe(50);
		});

		it("returns 0 for null product", () => {
			expect(getPriceForRegion(null, "china")).toBe(0);
		});
	});
});
