import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import CoupleReportDoc from "@/models/CoupleReportDoc";

export async function GET(request, { params }) {
	try {
		await dbConnect();

		const { reportId } = await params;

		const report = await CoupleReportDoc.findById(reportId);

		if (!report) {
			return NextResponse.json(
				{ success: false, error: "報告未找到" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			report: report,
		});
	} catch (error) {
		console.error("獲取合盤報告錯誤:", error);
		return NextResponse.json(
			{ success: false, error: "獲取報告失敗" },
			{ status: 500 }
		);
	}
}
