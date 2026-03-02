import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import ReportDoc from "@/models/ReportDoc";
import getWuxingData from "@/lib/nayin";

function generateDynamicPillarData(
	pillarName,
	stem,
	stemElement,
	branch,
	branchElement,
	baseData,
	random
) {
	const pillarKey = `${stem}${branch}`;
	if (baseData.nianzhuData?.[pillarKey]) {
		const arr = baseData.nianzhuData[pillarKey];
		return Array.isArray(arr) ? arr[random] : arr;
	}
	const elementData = {};
	const tianganKey = `天干${stemElement}`;
	const dizhiKey = `地支${branchElement}`;
	const allPillarData =
		baseData.nianzhuData ||
		baseData.yuezhuData ||
		baseData.rizhuData ||
		baseData.shizhuData ||
		{};
	const similarData = {};
	Object.entries(allPillarData).forEach(([key, values]) => {
		if (key.includes(stemElement) || key.includes(branchElement)) {
			const val = Array.isArray(values) ? values[random] || values[0] : values;
			Object.assign(similarData, val || {});
		}
	});
	elementData[tianganKey] = `${pillarName}天干${stem}属${stemElement}，主要影响外在表现和性格特质。`;
	elementData[dizhiKey] = `${pillarName}地支${branch}属${branchElement}，主要影响内在潜力和环境因素。`;
	elementData[`综合${stemElement}${branchElement}`] = `${pillarName}${pillarKey}的组合，天干${stemElement}与地支${branchElement}相互作用，形成独特的能量场。`;
	return { ...elementData, ...similarData };
}

export async function POST(request) {
	try {
		const { birthDateTime, gender, locale } = await request.json();
		if (!birthDateTime || !gender) {
			return NextResponse.json(
				{ error: "Missing birthDateTime or gender" },
				{ status: 400 }
			);
		}
		await dbConnect();
		const lang = locale === "zh-CN" ? "zh" : "tw";
		const doc = await ReportDoc.findOne({ language: lang }).select("-__v");
		const baseData = doc || {};
		const wuxingData = getWuxingData(birthDateTime, gender);
		if (!wuxingData) {
			return NextResponse.json(
				{ error: "Failed to calculate wuxing" },
				{ status: 400 }
			);
		}
		const {
			yearStem,
			yearStemWuxing,
			yearBranch,
			yearBranchWuxing,
			monthStem,
			monthStemWuxing,
			monthBranch,
			monthBranchWuxing,
			dayStem,
			dayStemWuxing,
			dayBranch,
			dayBranchWuxing,
			hourStem,
			hourStemWuxing,
			hourBranch,
			hourBranchWuxing,
		} = wuxingData;
		const random = 0;
		const yearKey = yearStem + yearBranch;
		const monthKey = monthStem + monthBranch;
		const dayKey = dayStem + dayBranch;
		const hourKey = hourStem + hourBranch;
		const nianzhuContent = generateDynamicPillarData(
			"年柱",
			yearStem,
			yearStemWuxing,
			yearBranch,
			yearBranchWuxing,
			baseData,
			random
		);
		const yuezhuContent = generateDynamicPillarData(
			"月柱",
			monthStem,
			monthStemWuxing,
			monthBranch,
			monthBranchWuxing,
			baseData,
			random
		);
		const rizhuContent = generateDynamicPillarData(
			"日柱",
			dayStem,
			dayStemWuxing,
			dayBranch,
			dayBranchWuxing,
			baseData,
			random
		);
		const shizhuContent = generateDynamicPillarData(
			"時柱",
			hourStem,
			hourStemWuxing,
			hourBranch,
			hourBranchWuxing,
			baseData,
			random
		);
		return NextResponse.json({
			nianzhuData: { [yearKey]: [nianzhuContent] },
			yuezhuData: { [monthKey]: [yuezhuContent] },
			rizhuData: { [dayKey]: [rizhuContent] },
			shizhuData: { [hourKey]: [shizhuContent] },
		});
	} catch (err) {
		console.error("report-pillar-data error:", err);
		return NextResponse.json(
			{ error: err.message || "Failed to generate pillar data" },
			{ status: 500 }
		);
	}
}
