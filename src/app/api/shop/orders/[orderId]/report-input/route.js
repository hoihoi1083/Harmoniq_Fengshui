import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { auth } from "@/auth";

// POST - Submit report input (sex, birthday, question) for an order. One-time only.
export async function POST(request, { params }) {
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
		const body = await request.json();
		const { sex, birthday, question, questions } = body;

		if (!sex || !birthday) {
			return NextResponse.json(
				{ success: false, error: "Missing sex or birthday" },
				{ status: 400 }
			);
		}

		const order = await Order.findById(orderId);
		if (!order) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		if (
			order.userId !== session.user.email &&
			order.userEmail !== session.user.email
		) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 403 }
			);
		}

		// Only treat normal gift reports from products (wealth/love/career/health).
		// Exclude report-print / report-digital which use per-item API.
		const giftReportTypes = [
			...new Set(
				(order.items || [])
					.filter(
						(i) =>
							i.giftReportType &&
							["wealth", "love", "career", "health"].includes(
								i.giftReportType,
							),
					)
					.map((i) => i.giftReportType),
			),
		];
		if (giftReportTypes.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Order has no gift report item" },
				{ status: 400 }
			);
		}

		// Only treat as "already submitted" when we have complete data (birthday + at least one question)
		const hasQuestion = order.reportInput?.question ||
			(order.reportInput?.questions && Object.values(order.reportInput.questions).some((q) => q));
		const hasCompleteReportInput = order.reportInput?.birthday && hasQuestion;
		if (hasCompleteReportInput) {
			return NextResponse.json(
				{ success: false, error: "Report info already submitted for this order" },
				{ status: 400 }
			);
		}

		const validSex = ["male", "female"].includes(sex) ? sex : "male";
		const trimmedBirthday = String(birthday).trim();

		// Build questions per report type
		const questionsMap = { wealth: "", love: "", career: "", health: "" };
		if (questions && typeof questions === "object") {
			for (const t of giftReportTypes) {
				const q = questions[t];
				if (typeof q !== "string" || !q.trim()) {
					return NextResponse.json(
						{ success: false, error: `Missing or empty question for report type: ${t}` },
						{ status: 400 }
					);
				}
				questionsMap[t] = q.trim();
			}
		} else if (typeof question === "string" && question.trim()) {
			// Single question: use for all report types in this order
			const single = question.trim();
			for (const t of giftReportTypes) questionsMap[t] = single;
		} else {
			return NextResponse.json(
				{ success: false, error: "Missing question(s) for report" },
				{ status: 400 }
			);
		}

		const reportInputPayload = {
			sex: validSex,
			birthday: trimmedBirthday,
			question: giftReportTypes.length === 1 ? questionsMap[giftReportTypes[0]] : undefined,
			questions: questionsMap,
			submittedAt: new Date(),
		};

		const updated = await Order.findByIdAndUpdate(
			orderId,
			{ $set: { reportInput: reportInputPayload } },
			{ new: true }
		);

		if (!updated) {
			return NextResponse.json(
				{ success: false, error: "Order not found after update" },
				{ status: 500 }
			);
		}

		// Return plain object so client gets reportInput (Mongoose doc serialization can omit nested)
		const plain = updated.toObject ? updated.toObject() : JSON.parse(JSON.stringify(updated));
		return NextResponse.json({
			success: true,
			data: plain,
		});
	} catch (error) {
		console.error("Error submitting report input:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
