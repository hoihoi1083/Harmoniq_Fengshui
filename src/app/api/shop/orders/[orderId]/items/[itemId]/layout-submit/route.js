import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/auth";
import { REPORT_PRODUCT_ID_BY_TYPE } from "@/lib/reportProducts";

async function loadAuthorizedOrderAndItem(orderId, itemId, userEmail) {
	const order = await Order.findById(orderId);
	if (!order) return { error: "Order not found", status: 404 };
	if (order.userId !== userEmail && order.userEmail !== userEmail) {
		return { error: "Unauthorized", status: 403 };
	}
	const item = (order.items || []).find((i) => String(i._id) === String(itemId));
	if (!item) return { error: "Order item not found", status: 404 };
	if (
		item.giftReportType !== "report-print" &&
		item.giftReportType !== "report-digital"
	) {
		return { error: "This item is not a standalone report", status: 400 };
	}
	const product = await Product.findById(item.productId).select("productId");
	if (!product || product.productId !== REPORT_PRODUCT_ID_BY_TYPE.fengshui) {
		return { error: "This item is not fengshui report", status: 400 };
	}
	return { order, item };
}

export async function POST(_request, { params }) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}
		await dbConnect();
		const { orderId, itemId } = await params;
		const result = await loadAuthorizedOrderAndItem(
			orderId,
			itemId,
			session.user.email,
		);
		if (result.error) {
			return NextResponse.json(
				{ success: false, error: result.error },
				{ status: result.status },
			);
		}
		const { order, item } = result;
		if (order.paymentStatus !== "paid") {
			return NextResponse.json(
				{ success: false, error: "Order is not paid yet" },
				{ status: 400 },
			);
		}
		if (!item.reportPrintInfo?.birthday) {
			return NextResponse.json(
				{ success: false, error: "Please submit birthday and question first" },
				{ status: 400 },
			);
		}
		if (!item.layoutDraftData) {
			return NextResponse.json(
				{ success: false, error: "Please complete layout drawing first" },
				{ status: 400 },
			);
		}
		if (item.layoutLocked) {
			return NextResponse.json(
				{ success: false, error: "Layout already submitted" },
				{ status: 400 },
			);
		}
		item.layoutStatus = "submitted";
		item.layoutLocked = true;
		item.layoutSubmittedAt = new Date();
		if (typeof order.markModified === "function") order.markModified("items");
		await order.save();
		return NextResponse.json({
			success: true,
			data: {
				layoutStatus: item.layoutStatus,
				layoutLocked: item.layoutLocked,
				layoutSubmittedAt: item.layoutSubmittedAt,
			},
		});
	} catch (error) {
		console.error("Error submitting fengshui layout:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}
