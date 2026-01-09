import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/auth";

// GET - Get specific order
export async function GET(request, { params }) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
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

		// Verify order belongs to user
		if (
			order.userId !== session.user.email &&
			order.userEmail !== session.user.email
		) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 403 }
			);
		}

		return NextResponse.json({
			success: true,
			data: order,
		});
	} catch (error) {
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
