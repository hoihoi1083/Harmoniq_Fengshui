import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { auth } from "@/auth";

// POST - Submit per-item printed report info (sex, birthday, time, question, address). One-time per item.
export async function POST(request, { params }) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		await dbConnect();

		// In app router dynamic routes, params is async
		const { orderId, itemId } = await params;
		const body = await request.json();
		const { sex, birthday, birthTime, question } = body;

		if (!sex || !birthday) {
			return NextResponse.json(
				{ success: false, error: "Missing sex or birthday" },
				{ status: 400 },
			);
		}

		const order = await Order.findById(orderId);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 },
			);
		}

		if (
			order.userId !== session.user.email &&
			order.userEmail !== session.user.email
		) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 403 },
			);
		}

		const item = (order.items || []).find(
			(i) => String(i._id) === String(itemId),
		);
		if (!item) {
			return NextResponse.json(
				{ success: false, error: "Order item not found" },
				{ status: 404 },
			);
		}

		// Accept both printed and digital standalone reports
		if (
			item.giftReportType !== "report-print" &&
			item.giftReportType !== "report-digital"
		) {
			return NextResponse.json(
				{ success: false, error: "This item is not a standalone report" },
				{ status: 400 },
			);
		}

		if (item.reportPrintInfo?.birthday) {
			return NextResponse.json(
				{ success: false, error: "Report info already submitted for this item" },
				{ status: 400 },
			);
		}

		const validSex = ["male", "female"].includes(sex) ? sex : "male";

		item.reportPrintInfo = {
			sex: validSex,
			birthday: String(birthday).trim(),
			birthTime: (birthTime || "").trim(),
			question: (question || "").trim(),
			submittedAt: new Date(),
		};

		// Ensure Mongoose knows nested array item was modified
		if (typeof order.markModified === "function") {
			order.markModified("items");
		}

		await order.save();

		const plain = order.toObject ? order.toObject() : JSON.parse(JSON.stringify(order));

		return NextResponse.json({
			success: true,
			data: plain,
		});
	} catch (error) {
		console.error("Error submitting per-item printed report info:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}

