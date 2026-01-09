import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/auth";

// GET - Get all orders (Admin only)
export async function GET(request) {
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

		const orders = await Order.find({})
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
