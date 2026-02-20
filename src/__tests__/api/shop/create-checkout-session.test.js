import { POST } from "@/app/api/shop/create-checkout-session/route";

jest.mock("@/auth", () => ({
	auth: jest.fn(),
}));

jest.mock("next/headers", () => ({
	headers: jest.fn(() =>
		Promise.resolve({
			get: () => "http://localhost:3000",
		})
	),
}));

jest.mock("@/lib/stripe", () => ({
	stripe: {
		checkout: {
			sessions: {
				create: jest.fn().mockResolvedValue({
					id: "cs_test_123",
					url: "https://checkout.stripe.com/xxx",
				}),
			},
		},
	},
}));

jest.mock("@/lib/mongoose", () => ({
	__esModule: true,
	default: jest.fn(() => Promise.resolve()),
}));

const mockOrderSave = jest.fn().mockResolvedValue(undefined);
jest.mock("@/models/Order", () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(() => ({
		orderId: "ORD-123",
		_id: "order_id_123",
		save: mockOrderSave,
		stripeSessionId: null,
	})),
}));

jest.mock("@/models/Product", () => ({
	__esModule: true,
	default: { findById: jest.fn() },
}));

jest.mock("@/models/Cart", () => ({
	__esModule: true,
	default: jest.fn(),
}));

const { auth } = require("@/auth");
const Product = require("@/models/Product").default;
const { stripe } = require("@/lib/stripe");

function createRequest(body) {
	return new Request("http://localhost:3000/api/shop/create-checkout-session", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

const validShipping = {
	fullName: "Test User",
	phone: "12345678",
	address: "123 Street",
	city: "HK",
	country: "香港",
};

const mockProduct = (overrides = {}) => ({
	_id: "507f1f77bcf86cd799439011",
	name: { zh_TW: "Test Product", "zh-CN": "Test" },
	description: { zh_TW: "Desc", "zh-CN": "Desc" },
	price: 100,
	priceCNY: 88,
	priceHKD: 100,
	priceTWD: 380,
	images: [],
	isActive: true,
	isDigital: true,
	stock: 10,
	discount: { percentage: 0 },
	...overrides,
});

describe("POST /api/shop/create-checkout-session", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockOrderSave.mockResolvedValue(undefined);
		process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_mock";
	});

	it("returns 401 when not authenticated", async () => {
		auth.mockResolvedValue(null);

		const res = await POST(
			createRequest({
				items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
				shippingInfo: validShipping,
				billingInfo: validShipping,
				locale: "zh-TW",
			})
		);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.success).toBe(false);
	});

	it("returns 400 when items is empty", async () => {
		auth.mockResolvedValue({ user: { email: "user@test.com" } });

		const res = await POST(
			createRequest({
				items: [],
				shippingInfo: validShipping,
				billingInfo: validShipping,
				locale: "zh-TW",
			})
		);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.success).toBe(false);
		expect(data.error).toMatch(/no items|items/i);
	});

	it("returns 400 when shipping info missing", async () => {
		auth.mockResolvedValue({ user: { email: "user@test.com" } });

		const res = await POST(
			createRequest({
				items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
				shippingInfo: { fullName: "", phone: "" },
				billingInfo: {},
				locale: "zh-TW",
			})
		);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.success).toBe(false);
	});

	it("uses CNY and priceCNY when region is china", async () => {
		auth.mockResolvedValue({ user: { email: "user@test.com" } });
		Product.findById.mockResolvedValue(mockProduct());

		const res = await POST(
			createRequest({
				items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
				shippingInfo: validShipping,
				billingInfo: validShipping,
				locale: "zh-CN",
				region: "china",
			})
		);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.url).toBeDefined();

		expect(stripe.checkout.sessions.create).toHaveBeenCalled();
		const createCall = stripe.checkout.sessions.create.mock.calls[0][0];
		expect(createCall.line_items[0].price_data.currency).toBe("cny");
		expect(createCall.line_items[0].price_data.unit_amount).toBe(88 * 100);
	});

	it("uses TWD and priceTWD when region is taiwan", async () => {
		auth.mockResolvedValue({ user: { email: "user@test.com" } });
		Product.findById.mockResolvedValue(mockProduct());

		const res = await POST(
			createRequest({
				items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
				shippingInfo: validShipping,
				billingInfo: validShipping,
				locale: "zh-TW",
				region: "taiwan",
			})
		);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
		const createCall = stripe.checkout.sessions.create.mock.calls[0][0];
		expect(createCall.line_items[0].price_data.currency).toBe("twd");
		expect(createCall.line_items[0].price_data.unit_amount).toBe(380 * 100);
	});

	it("uses HKD and priceHKD when region is hongkong", async () => {
		auth.mockResolvedValue({ user: { email: "user@test.com" } });
		Product.findById.mockResolvedValue(mockProduct());

		const res = await POST(
			createRequest({
				items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
				shippingInfo: validShipping,
				billingInfo: validShipping,
				locale: "zh-TW",
				region: "hongkong",
			})
		);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
		const createCall = stripe.checkout.sessions.create.mock.calls[0][0];
		expect(createCall.line_items[0].price_data.currency).toBe("hkd");
		expect(createCall.line_items[0].price_data.unit_amount).toBe(100 * 100);
	});
});
