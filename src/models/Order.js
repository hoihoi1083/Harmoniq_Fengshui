import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
	orderId: {
		type: String,
		required: true,
		unique: true,
	},
	userId: {
		type: String,
		required: true,
	},
	userEmail: String,
	items: [
		{
			productId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
			productName: String,
			productImage: String,
			quantity: Number,
			price: Number,
			isDigital: Boolean,
		},
	],
	subtotal: Number,
	shippingFee: {
		type: Number,
		default: 0,
	},
	discount: {
		type: Number,
		default: 0,
	},
	totalAmount: {
		type: Number,
		required: true,
	},
	currency: {
		type: String,
		default: "HKD",
	},
	status: {
		type: String,
		enum: [
			"pending",
			"paid",
			"processing",
			"shipped",
			"delivered",
			"completed",
			"cancelled",
			"refunded",
		],
		default: "pending",
	},
	shippingAddress: {
		fullName: String,
		phone: String,
		address: String,
		city: String,
		province: String,
		postalCode: String,
		country: String,
	},
	billingAddress: {
		fullName: String,
		phone: String,
		address: String,
		city: String,
		province: String,
		postalCode: String,
		country: String,
	},
	shippingMethod: String,
	trackingNumber: String,
	stripeSessionId: String,
	stripePaymentIntentId: String,
	paymentStatus: {
		type: String,
		enum: ["pending", "paid", "failed", "refunded"],
		default: "pending",
	},
	notes: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	paidAt: Date,
	shippedAt: Date,
	deliveredAt: Date,
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Update timestamp before saving
OrderSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
