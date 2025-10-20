import { NextRequest, NextResponse } from "next/server";
import { EnhancedInitialAnalysis } from "@/lib/enhancedInitialAnalysis";
import { BaziCalculator } from "@/lib/baziCalculator";

// Helper function to calculate Ba Zi with accurate time-based hour pillar
const calculateBaziWithTime = (birthDateTime) => {
	try {
		// Handle missing time by defaulting to 12:00 (noon)
		let fullDateTime = birthDateTime;
		if (
			typeof birthDateTime === "string" &&
			!birthDateTime.includes("T") &&
			!birthDateTime.includes(" ")
		) {
			fullDateTime = `${birthDateTime} 12:00`;
		}

		const date = new Date(fullDateTime);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const hour = date.getHours();

		// Use BaziCalculator for accurate year and day pillars
		const yearPillar = BaziCalculator.getYearPillar(year);
		const dayPillar = BaziCalculator.getDayPillar(date);

		// Calculate month pillar using traditional 五虎遁法
		const monthPillarResult = BaziCalculator.getMonthPillar(year, month);
		const monthPillar = monthPillarResult.combined;

		// Calculate hour pillar based on actual birth time (defaults to noon if not specified)
		const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
		const dayStemIndex = BaziCalculator.tianGan.indexOf(dayPillar.tianGan);
		const hourStemIndex = (dayStemIndex * 12 + hourBranchIndex) % 10;
		const hourPillar =
			BaziCalculator.tianGan[hourStemIndex] +
			BaziCalculator.diZhi[hourBranchIndex];

		return {
			year: `${yearPillar.tianGan}${yearPillar.diZhi}`,
			month: monthPillar,
			day: `${dayPillar.tianGan}${dayPillar.diZhi}`,
			hour: hourPillar,
			yearElement: yearPillar.element,
			dayElement: dayPillar.element,
		};
	} catch (error) {
		console.error(
			"BaziCalculator error, using fallback calculation:",
			error
		);
		// Safer fallback with basic calculation instead of EnhancedInitialAnalysis
		const date = new Date(birthDateTime);
		const year = date.getFullYear();
		return {
			year: `甲戌`, // Default fallback
			month: `丙寅`,
			day: `己丑`,
			hour: `甲子`,
			yearElement: `木`,
			dayElement: `土`,
		};
	}
};

export async function POST(request) {
	try {
		// Parse request body with error handling
		let requestBody;
		try {
			requestBody = await request.json();
		} catch (jsonError) {
			console.error(
				"Invalid JSON in individual-analysis request:",
				jsonError
			);
			return NextResponse.json(
				{ error: "Invalid JSON format in request body" },
				{ status: 400 }
			);
		}

		const {
			birthDateTime,
			dominantElement,
			category,
			specificQuestion,
			gender,
		} = requestBody;

		if (!birthDateTime) {
			return NextResponse.json(
				{ error: "Missing required birthday information" },
				{ status: 400 }
			);
		}

		// Generate AI-powered individual analysis with accurate Ba Zi calculation
		const birthday = new Date(birthDateTime);
		const bazi = calculateBaziWithTime(birthDateTime);

		// Call AI analysis on server side
		const individualAI =
			await EnhancedInitialAnalysis.generatePersonalAIAnalysis(
				birthday,
				dominantElement || bazi.yearElement,
				category || "感情",
				specificQuestion ||
					`請詳細分析${gender || "此人"}的八字特性和性格特質`
			);

		return NextResponse.json({
			success: true,
			aiAnalysis: individualAI,
			baziData: bazi,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error in individual analysis:", error);
		return NextResponse.json(
			{
				error: "Failed to generate individual analysis",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
