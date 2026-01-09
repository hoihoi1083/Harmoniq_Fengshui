import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
		unique: true,
	},
	items: [
		{
			productId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
			quantity: {
				type: Number,
				default: 1,
				min: 1,
			},
			addedAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Update timestamp before saving
CartSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
