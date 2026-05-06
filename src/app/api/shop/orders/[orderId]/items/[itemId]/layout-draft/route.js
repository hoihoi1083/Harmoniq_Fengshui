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

export async function GET(_request, { params }) {
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
		const isOrderPaid = order.paymentStatus === "paid";
		const hasReportProfile = !!item.reportPrintInfo?.birthday;
		const canSubmitLayout =
			isOrderPaid && hasReportProfile && !item.layoutLocked;
		return NextResponse.json({
			success: true,
			data: {
				layoutStatus: item.layoutStatus || "not_started",
				layoutLocked: !!item.layoutLocked,
				layoutSubmittedAt: item.layoutSubmittedAt || null,
				layoutDraftUpdatedAt: item.layoutDraftUpdatedAt || null,
				layoutDraftData: item.layoutDraftData || null,
				layoutPreviewImage: item.layoutPreviewImage || "",
				isOrderPaid,
				hasReportProfile,
				canSubmitLayout,
			},
		});
	} catch (error) {
		console.error("Error loading fengshui layout draft:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}

export async function PUT(request, { params }) {
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
		if (item.layoutLocked) {
			return NextResponse.json(
				{ success: false, error: "Layout already submitted and locked" },
				{ status: 400 },
			);
		}
		const body = await request.json();
		item.layoutDraftData = body?.layoutDraftData || null;
		item.layoutPreviewImage = String(body?.layoutPreviewImage || "").trim();
		item.layoutDraftUpdatedAt = new Date();
		item.layoutStatus = "draft";
		if (typeof order.markModified === "function") order.markModified("items");
		await order.save();
		return NextResponse.json({
			success: true,
			data: {
				layoutStatus: item.layoutStatus,
				layoutLocked: !!item.layoutLocked,
				layoutDraftUpdatedAt: item.layoutDraftUpdatedAt,
			},
		});
	} catch (error) {
		console.error("Error saving fengshui layout draft:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}
