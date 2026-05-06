import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import getRoomDirection from "@/app/[locale]/design/getRoomDirection";
import { auth } from "@/auth";
import { REPORT_PRODUCT_ID_BY_TYPE } from "@/lib/reportProducts";

function isAdminUser(session) {
	return (
		session?.user?.userId === "harmoniqadmin" ||
		session?.user?.email === "harmoniqadmin@harmoniq.com"
	);
}

function parseUserProfileFromItem(item) {
	const birthday = String(item?.reportPrintInfo?.birthday || "").trim();
	const sex = String(item?.reportPrintInfo?.sex || "male").trim();
	const birthTime = String(item?.reportPrintInfo?.birthTime || "").trim();
	const parts = birthday.split("-");
	if (parts.length !== 3) return null;
	const birthYear = Number(parts[0]);
	const birthMonth = Number(parts[1]);
	const birthDay = Number(parts[2]);
	if (!birthYear || !birthMonth || !birthDay) return null;
	let birthHour = 12;
	const matchedHour = birthTime.match(/(\d{1,2})/);
	if (matchedHour) {
		const h = Number(matchedHour[1]);
		if (Number.isFinite(h) && h >= 0 && h <= 23) birthHour = h;
	}
	return {
		gender: sex === "female" ? "女" : "男",
		birthYear,
		birthMonth,
		birthDay,
		birthHour,
	};
}

export async function POST(request, { params }) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}
		if (!isAdminUser(session)) {
			return NextResponse.json(
				{ success: false, error: "Forbidden" },
				{ status: 403 },
			);
		}

		await dbConnect();
		const { orderId, itemId } = await params;
		const order = await Order.findById(orderId);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 },
			);
		}
		const item = (order.items || []).find((i) => String(i._id) === String(itemId));
		if (!item) {
			return NextResponse.json(
				{ success: false, error: "Order item not found" },
				{ status: 404 },
			);
		}
		const product = await Product.findById(item.productId).select("productId");
		if (!product || product.productId !== REPORT_PRODUCT_ID_BY_TYPE.fengshui) {
			return NextResponse.json(
				{ success: false, error: "This item is not fengshui report" },
				{ status: 400 },
			);
		}
		if (!item.reportPrintInfo?.birthday) {
			return NextResponse.json(
				{ success: false, error: "Customer report profile is incomplete" },
				{ status: 400 },
			);
		}
		if (!item.layoutDraftData) {
			return NextResponse.json(
				{ success: false, error: "Layout draft is empty" },
				{ status: 400 },
			);
		}

		item.layoutStatus = "admin_processing";
		if (typeof order.markModified === "function") order.markModified("items");
		await order.save();

		const designData = {
			localItems: item.layoutDraftData?.localItems || [],
			canvasPosition: item.layoutDraftData?.canvasPosition || { x: 0, y: 0 },
			compassRotation: item.layoutDraftData?.compassRotation || 0,
			scale: item.layoutDraftData?.scale || 100,
		};
		const userProfile = parseUserProfileFromItem(item);
		if (!userProfile) {
			return NextResponse.json(
				{ success: false, error: "Invalid birthday data" },
				{ status: 400 },
			);
		}

		const dataWithDirections = getRoomDirection(designData);
		const rooms = (dataWithDirections?.localItems || [])
			.filter((it) => it.type === "room")
			.map((room) => ({
				...room,
				roomType: room.roomType || room.data?.type || room.type,
			}));

		const response = await fetch(new URL("/api/bazhai-analysis", request.url), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				rooms,
				userProfile,
				designSummary: {
					totalRooms: rooms.length,
					auspiciousRooms: 0,
					inauspiciousRooms: 0,
					compassRotation: dataWithDirections?.compassRotation || 0,
				},
			}),
		});
		const result = await response.json();
		if (!response.ok || !result?.success || !result?.data) {
			throw new Error(result?.error || "Bazhai generation failed");
		}

		const preparedAnalysisData = {
			...result.data,
			layoutItems: dataWithDirections?.localItems || [],
		};

		item.layoutGeneratedReportData = preparedAnalysisData;
		item.layoutGeneratedAt = new Date();
		item.layoutGeneratedBy = session.user.email;
		item.layoutStatus = "completed";
		if (typeof order.markModified === "function") order.markModified("items");
		await order.save();

		return NextResponse.json({
			success: true,
			data: {
				preparedAnalysisData,
				layoutStatus: item.layoutStatus,
				layoutGeneratedAt: item.layoutGeneratedAt,
			},
		});
	} catch (error) {
		console.error("Error generating fengshui print report:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}
