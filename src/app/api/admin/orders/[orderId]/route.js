import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/auth";
import { sendShippingNotificationEmail } from "@/lib/emailService";

// GET - Get specific order (Admin only)
export async function GET(request, { params }) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is admin
		const isAdmin =
			session.user.userId === "harmoniqadmin" ||
			session.user.email === "harmoniqadmin@harmoniq.com";

		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, error: "Forbidden" },
				{ status: 403 }
			);
		}

		await dbConnect();

		const { orderId } = await params;

		const order = await Order.findById(orderId).populate("items.productId");

		if (!order) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			order: order,
		});
	} catch (error) {
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// PATCH - Update order status (Admin only)
export async function PATCH(request, { params }) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is admin
		const isAdmin =
			session.user.userId === "harmoniqadmin" ||
			session.user.email === "harmoniqadmin@harmoniq.com";

		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, error: "Forbidden" },
				{ status: 403 }
			);
		}

		await dbConnect();

		const { orderId } = await params;
		const body = await request.json();
		const { status, trackingNumber, shippingMethod } = body;

		const order = await Order.findById(orderId);

		if (!order) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		// Update fields
		if (status) {
			order.paymentStatus = status; // Update paymentStatus field
			order.status = status; // Also update status field for consistency
		}
		if (trackingNumber) order.trackingNumber = trackingNumber;
		if (shippingMethod) order.shippingMethod = shippingMethod;

		// Set timestamps based on status
		if (status === "shipped" && !order.shippedAt) {
			order.shippedAt = new Date();

			// Send shipping notification email
			try {
				const locale =
					order.shippingAddress?.country === "中国" ||
					order.shippingAddress?.country === "China"
						? "zh-CN"
						: "zh-TW";
				await sendShippingNotificationEmail(
					order,
					trackingNumber,
					locale
				);
				console.log("📧 Shipping notification email sent");
			} catch (emailError) {
				console.error(
					"Failed to send shipping notification:",
					emailError
				);
			}
		}
		if (status === "delivered" && !order.deliveredAt) {
			order.deliveredAt = new Date();
		}

		await order.save();

		return NextResponse.json({
			success: true,
			order: order,
			message: "Order updated successfully",
		});
	} catch (error) {
		console.error("Error updating order:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
