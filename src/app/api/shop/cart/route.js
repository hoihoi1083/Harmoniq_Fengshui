import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { auth } from "@/auth";

// GET user's cart
export async function GET(request) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		await dbConnect();

		let cart = await Cart.findOne({ userId: session.user.email }).populate(
			"items.productId"
		);

		if (!cart) {
			// Create empty cart if doesn't exist
			cart = new Cart({
				userId: session.user.email,
				items: [],
			});
			await cart.save();
		}

		// Transform the response to match expected format
		const transformedCart = {
			...cart.toObject(),
			items: cart.items.map((item) => ({
				_id: item._id,
				product: item.productId,
				quantity: item.quantity,
			})),
		};

		return NextResponse.json({
			success: true,
			data: transformedCart,
		});
	} catch (error) {
		console.error("Error fetching cart:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// POST add item to cart
export async function POST(request) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { productId, quantity, setAbsolute } = await request.json();

		if (!productId || !quantity) {
			return NextResponse.json(
				{ success: false, error: "Product ID and quantity are required" },
				{ status: 400 }
			);
		}

		await dbConnect();

		// Verify product exists and has stock
		const product = await Product.findById(productId);
		if (!product || !product.isActive) {
			return NextResponse.json(
				{ success: false, error: "Product not found" },
				{ status: 404 }
			);
		}

		if (!product.isDigital && product.stock < quantity) {
			return NextResponse.json(
				{ success: false, error: "Insufficient stock" },
				{ status: 400 }
			);
		}

		// Get or create cart
		let cart = await Cart.findOne({ userId: session.user.email });

		if (!cart) {
			cart = new Cart({
				userId: session.user.email,
				items: [],
			});
		}

		// Check if product already in cart
		const existingItemIndex = cart.items.findIndex(
			(item) => item.productId.toString() === productId
		);

		if (existingItemIndex > -1) {
			// Update quantity - either set absolute or add to existing
			if (setAbsolute) {
				cart.items[existingItemIndex].quantity = quantity;
			} else {
				cart.items[existingItemIndex].quantity += quantity;
			}
		} else {
			// Add new item
			cart.items.push({
				productId,
				quantity,
			});
		}

		await cart.save();

		// Populate product details
		await cart.populate("items.productId");

		// Transform the response to match expected format
		const transformedCart = {
			...cart.toObject(),
			items: cart.items.map((item) => ({
				_id: item._id,
				product: item.productId,
				quantity: item.quantity,
			})),
		};

		return NextResponse.json({
			success: true,
			data: transformedCart,
			message: "Product added to cart",
		});
	} catch (error) {
		console.error("Error adding to cart:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// DELETE - Remove item from cart
export async function DELETE(request) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { productId, quantity, setAbsolute } = await request.json();

		if (!productId) {
			return NextResponse.json(
				{ success: false, error: "Product ID is required" },
				{ status: 400 }
			);
		}

		await dbConnect();

		// Find user's cart
		let cart = await Cart.findOne({ userId: session.user.email });

		if (!cart) {
			return NextResponse.json({
				success: true,
				data: { items: [] },
				message: "Cart is empty",
			});
		}

		// Remove item from cart
		cart.items = cart.items.filter(
			(item) => item.productId.toString() !== productId
		);

		await cart.save();

		// Populate product details
		await cart.populate("items.productId");

		// Transform the response to match expected format
		const transformedCart = {
			...cart.toObject(),
			items: cart.items.map((item) => ({
				_id: item._id,
				product: item.productId,
				quantity: item.quantity,
			})),
		};

		return NextResponse.json({
			success: true,
			data: transformedCart,
			message: "Item removed from cart",
		});
	} catch (error) {
		console.error("Error removing from cart:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
