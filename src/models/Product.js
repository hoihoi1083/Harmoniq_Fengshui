import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
	productId: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		zh_TW: { type: String, required: true },
		zh_CN: { type: String, required: true },
		en: { type: String },
	},
	description: {
		zh_TW: { type: String, required: true },
		zh_CN: { type: String, required: true },
		en: { type: String },
	},
	category: {
		type: String,
		enum: ["charm", "decoration", "ebook", "service", "consultation"],
		required: true,
		default: "charm",
	},
	price: {
		type: Number,
		required: true,
	},
	originalPrice: {
		type: Number, // For showing discounts
	},
	currency: {
		type: String,
		default: "HKD",
		enum: ["HKD", "CNY", "USD"],
	},
	images: [String],
	thumbnailImage: String,
	stock: {
		type: Number,
		default: 0,
	},
	isDigital: {
		type: Boolean,
		default: false,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	isFeatured: {
		type: Boolean,
		default: false,
	},
	stripeProductId: String,
	stripePriceId: String,
	tags: [String], // e.g., ['wealth', 'love', 'career', 'health', 'protection']
	elementType: {
		type: String,
		enum: ["wood", "fire", "earth", "metal", "water", "neutral", "none"],
	},
	benefits: [String], // List of benefits in Chinese
	usageInstructions: {
		zh_TW: String,
		zh_CN: String,
	},
	specifications: {
		material: String, // e.g., "天然水晶", "玉石", "銅製"
		size: String, // e.g., "直徑3cm", "長度15cm"
		weight: String, // e.g., "50g"
	},
	rating: {
		average: { type: Number, default: 0 },
		count: { type: Number, default: 0 },
	},
	soldCount: {
		type: Number,
		default: 0,
	},
	discount: {
		percentage: { type: Number, default: 0 }, // e.g., 20 for 20% off
		validUntil: Date,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Update the updatedAt timestamp before saving
ProductSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

// Virtual for calculating discounted price
ProductSchema.virtual("discountedPrice").get(function () {
	if (this.discount && this.discount.percentage > 0) {
		const now = new Date();
		const validUntil = this.discount.validUntil;
		if (!validUntil || now <= validUntil) {
			return this.price * (1 - this.discount.percentage / 100);
		}
	}
	return this.price;
});

// Virtual alias for sold (maps to soldCount)
ProductSchema.virtual("sold")
	.get(function () {
		return this.soldCount;
	})
	.set(function (value) {
		this.soldCount = value;
	});

// Include virtuals when converting to JSON
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

export default mongoose.models.Product ||
	mongoose.model("Product", ProductSchema);
