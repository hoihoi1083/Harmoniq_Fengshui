import { GET, POST } from "@/app/api/shop/cart/route";

jest.mock("@/auth", () => ({
	auth: jest.fn(),
}));

jest.mock("@/lib/mongoose", () => ({
	__esModule: true,
	default: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/models/Cart", () => {
	const mockSave = jest.fn().mockResolvedValue(undefined);
	const mockPopulate = jest.fn().mockReturnThis();
	return {
		__esModule: true,
		default: jest.fn().mockImplementation(() => ({
			userId: "test@test.com",
			items: [],
			save: mockSave,
			populate: mockPopulate,
			toObject: () => ({ items: [] }),
			findOne: jest.fn(),
			findOneAndUpdate: jest.fn(),
		})),
	};
});

jest.mock("@/models/Product", () => ({
	__esModule: true,
	default: {
		findById: jest.fn(),
	},
}));

const { auth } = require("@/auth");
const Cart = require("@/models/Cart").default;
const Product = require("@/models/Product").default;

function createRequest({ method = "GET", body = {} } = {}) {
	return new Request("http://localhost:3000/api/shop/cart", {
		method,
		headers: { "Content-Type": "application/json" },
		body: method !== "GET" ? JSON.stringify(body) : undefined,
	});
}

describe("POST /api/shop/cart", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns 401 when not authenticated", async () => {
		auth.mockResolvedValue(null);

		const res = await POST(
			createRequest({
				method: "POST",
				body: { productId: "507f1f77bcf86cd799439011", quantity: 1 },
			})
		);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.success).toBe(false);
		expect(data.error).toMatch(/unauthorized/i);
	});

	it("returns 400 when productId or quantity missing", async () => {
		auth.mockResolvedValue({ user: { email: "user@test.com" } });

		const res = await POST(
			createRequest({
				method: "POST",
				body: { quantity: 1 },
			})
		);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.success).toBe(false);
		expect(data.error).toMatch(/product|quantity/i);
	});

	it("returns 404 when product not found", async () => {
		auth.mockResolvedValue({ user: { email: "user@test.com" } });
		Product.findById.mockResolvedValue(null);

		const res = await POST(
			createRequest({
				method: "POST",
				body: { productId: "507f1f77bcf86cd799439011", quantity: 1 },
			})
		);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.success).toBe(false);
		expect(data.error).toMatch(/not found/i);
	});
});

describe("GET /api/shop/cart", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns 401 when not authenticated", async () => {
		auth.mockResolvedValue(null);

		const res = await GET(createRequest());
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.success).toBe(false);
	});
});
