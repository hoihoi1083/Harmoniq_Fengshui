import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { auth } from "@/auth";

// POST - Create new order
export async function POST(request) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { items, shippingInfo, billingInfo, subtotal, shippingFee, total } =
			await request.json();

		if (!items || items.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No items in order" },
				{ status: 400 }
			);
		}

		if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phone) {
			return NextResponse.json(
				{ success: false, error: "Missing shipping information" },
				{ status: 400 }
			);
		}

		await dbConnect();

		// Verify all products exist and have sufficient stock
		for (const item of items) {
			const product = await Product.findById(item.productId);
			if (!product || !product.isActive) {
				return NextResponse.json(
					{
						success: false,
						error: `Product ${item.productId} not found or inactive`,
					},
					{ status: 404 }
				);
			}

			if (!product.isDigital && product.stock < item.quantity) {
				return NextResponse.json(
					{
						success: false,
						error: `Insufficient stock for ${product.name.zh_TW}`,
					},
					{ status: 400 }
				);
			}
		}

		// Create order
		const order = new Order({
			userId: session.user.email,
			items: items.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				price: item.price,
				discount: item.discount || 0,
			})),
			shippingInfo: {
				fullName: shippingInfo.fullName,
				email: shippingInfo.email,
				phone: shippingInfo.phone,
				address: shippingInfo.address,
				city: shippingInfo.city,
				state: shippingInfo.state || "",
				postalCode: shippingInfo.postalCode || "",
				country: shippingInfo.country,
			},
			billingInfo: {
				fullName: billingInfo.fullName,
				address: billingInfo.address,
				city: billingInfo.city,
				state: billingInfo.state || "",
				postalCode: billingInfo.postalCode || "",
				country: billingInfo.country,
			},
			subtotal,
			shippingFee: shippingFee || 0,
			total,
			status: "pending",
			paymentStatus: "pending",
			notes: shippingInfo.notes || "",
		});

		await order.save();

		// Update product stock for physical items
		for (const item of items) {
			const product = await Product.findById(item.productId);
			if (product && !product.isDigital) {
				product.stock -= item.quantity;
				await product.save();
			}
		}

		// Clear user's cart
		await Cart.findOneAndUpdate(
			{ userId: session.user.email },
			{ $set: { items: [] } }
		);

		// Populate product details for response
		await order.populate("items.productId");

		return NextResponse.json({
			success: true,
			data: order,
			message: "Order created successfully",
		});
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// GET - Get user's orders
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

		const orders = await Order.find({ userId: session.user.email })
			.populate("items.productId")
			.sort({ createdAt: -1 });

		return NextResponse.json({
			success: true,
			data: orders,
		});
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
