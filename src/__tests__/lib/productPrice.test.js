import { getProductDisplayPrice } from "@/lib/productPrice";

describe("productPrice.getProductDisplayPrice", () => {
	it("returns price and symbol for hongkong", () => {
		const product = { price: 100, priceHKD: 100 };
		const result = getProductDisplayPrice(product, "hongkong");
		expect(result.price).toBe(100);
		expect(result.symbol).toBe("HK$");
		expect(result.discountedPrice).toBe(100);
	});

	it("returns priceCNY and ¥ for china", () => {
		const product = { price: 100, priceCNY: 88 };
		const result = getProductDisplayPrice(product, "china");
		expect(result.price).toBe(88);
		expect(result.symbol).toBe("¥");
	});

	it("returns priceTWD and NT$ for taiwan", () => {
		const product = { price: 100, priceTWD: 380 };
		const result = getProductDisplayPrice(product, "taiwan");
		expect(result.price).toBe(380);
		expect(result.symbol).toBe("NT$");
	});

	it("calculates discountedPrice when product has discount", () => {
		const product = { price: 100, discount: { percentage: 10 } };
		const result = getProductDisplayPrice(product, "hongkong");
		expect(result.price).toBe(100);
		expect(result.discountedPrice).toBe(90);
	});

	it("returns safe defaults for null product", () => {
		const result = getProductDisplayPrice(null, "hongkong");
		expect(result.price).toBe(0);
		expect(result.symbol).toBe("HK$");
		expect(result.discountedPrice).toBe(0);
	});
});
