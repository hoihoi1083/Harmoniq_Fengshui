"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BaziCalculator } from "@/lib/baziCalculator";

function PrintReportView() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const locale = useLocale();

	const [aiContent, setAiContent] = useState(null);
	const [baziData, setBaziData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// Get parameters from URL
	const concern = searchParams.get("concern") || "財運";
	const gender = searchParams.get("gender") || "male";
	const birthday = searchParams.get("birthday") || "";
	const birthTime = searchParams.get("birthTime") || "";
	const question = searchParams.get("question") || "";

	const concernColors = {
		財運: "#AD7F00",
		健康: "#389D7D",
		感情: "#D94075",
		事業: "#567156",
	};

	// Helper function to calculate BaZi
	const calculateBazi = (birthDate, birthTimeStr) => {
		try {
			const date = new Date(birthDate);
			
			// Parse birth time (e.g., "辰時 (07:00-09:00)")
			const hourMatch = birthTimeStr.match(/(\d+):00/);
			const hour = hourMatch ? parseInt(hourMatch[1]) : 12;
			date.setHours(hour);

			// Calculate four pillars
			const yearPillar = BaziCalculator.getYearPillar(date);
			const monthPillar = BaziCalculator.getMonthPillar(date, date.getMonth() + 1);
			const dayPillar = BaziCalculator.getDayPillar(date);
			
			// Calculate hour pillar
			const dayStemIndex = BaziCalculator.tianGan.indexOf(dayPillar.tianGan);
			const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
			const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;
			const hourPillar = {
				tianGan: BaziCalculator.tianGan[hourStemIndex],
				diZhi: BaziCalculator.diZhi[hourBranchIndex],
			};

				// Calculate five elements
			const elementMap = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };
			const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
			[yearPillar, monthPillar, dayPillar, hourPillar].forEach(pillar => {
				const stemElement = BaziCalculator.wuXing[pillar.tianGan];
				const branchElement = BaziCalculator.wuXing[pillar.diZhi];
				if (stemElement) elements[elementMap[stemElement]]++;
				if (branchElement) elements[elementMap[branchElement]]++;
			});

			return {
				fourPillars: {
					year: { heavenly: yearPillar.tianGan, earthly: yearPillar.diZhi },
					month: { heavenly: monthPillar.tianGan, earthly: monthPillar.diZhi },
					day: { heavenly: dayPillar.tianGan, earthly: dayPillar.diZhi },
					hour: { heavenly: hourPillar.tianGan, earthly: hourPillar.diZhi },
				},
				fiveElements: elements,
				dayMaster: dayPillar.tianGan,
			};
		} catch (error) {
			console.error("BaZi calculation error:", error);
			return null;
		}
	};

	useEffect(() => {
		const generateReportData = async () => {
			try {
				setIsLoading(true);

				// Calculate BaZi data client-side
				const baziData = calculateBazi(birthday, birthTime);
				
				if (!baziData) {
					throw new Error("Failed to calculate BaZi");
				}

				console.log("🎯 Starting AI-powered report generation...");
				console.log("User inputs:", { birthday, birthTime, gender, concern, question });

				// Helper to extract clean text from AI response (handles both plain text and JSON)
				const extractContent = (response) => {
					if (!response || !response.content) return "";
					
					// If content is already a string, return it
					if (typeof response.content === 'string') {
						try {
							// Try to parse as JSON first
							const parsed = JSON.parse(response.content);
							// If it's an object with analysis field, extract that
							if (parsed.analysis) return parsed.analysis;
							// If it has sections, join them
							if (parsed.sections && Array.isArray(parsed.sections)) {
								return parsed.sections.map(s => s.content || s.text || '').join('\n\n');
							}
							// Otherwise return the whole thing as string
							return JSON.stringify(parsed);
						} catch {
							// Not JSON, return as-is
							return response.content;
						}
					}
					
					return "";
				};

				// Call AI Analysis API for real content generation (same as web-side)
				const aiResponses = await Promise.all([
					// 1. Day Master (日主特性) Analysis
					fetch("/api/ai-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							prompt: `分析此八字的日主特性：
生日：${birthday}
性別：${gender}
關注：${concern}
問題：${question}

請按照以下格式提供詳細分析：

1️⃣ 日主特質
	• ${baziData.dayMaster}日主特性，例：注重規劃/紀律
	• 平衡務實，例：保持平衡
	• 性格特點，例：穩重包容

2️⃣ 優勢分析
	• 優勢1：主導專案/穩健布局
	• 優勢2：定位清晰，可持續累積

3️⃣ 劣勢與挑戰
	• 劣勢1：決策前需二次評估
	• 劣勢2：經驗尚淺，需導師指引

4️⃣ 調候與策略
	• 調候需求：用水木調候，平衡剛柔
	• 實踐方向：穩推核心專案，強化協作

5️⃣ 針對性建議
	• 短期策略：3-6月聚焦核心成果，減少分心
	• 長期規劃：建立體系化能力，穩步升級`,
							userInfo: { birthDateTime: birthday, gender, concern, problem: question },
							analysisType: "日主特性",
							locale: locale,
						}),
					}),
					
					// 2. Wealth/Career Position Analysis (財星定位/事業宮)
					fetch("/api/ai-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							prompt: `分析${concern}配置與策略：
生日：${birthday}
性別：${gender}
關注：${concern}

請提供以下內容：
1. ${concern}配置：您的${concern}在命盤中的位置與特質
2. 發展路徑：適合的${concern}發展方向與方式
3. 成功密碼：關鍵成功因素與時機把握
4. 總結：整體${concern}運勢與建議`,
							userInfo: { birthDateTime: birthday, gender, concern, problem: question },
							analysisType: `${concern}定位`,
							locale: locale,
						}),
					}),

					// 3. 2026 Year Fortune Analysis (流年詳解)
					fetch("/api/ai-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							prompt: `分析2026年丙午年運勢：
生日：${birthday}
性別：${gender}
關注：${concern}

請提供詳細的2026年流年分析，包括：
1. 流年干支作用：2026丙午年與命局的相互作用
2. 在${concern}領域的具體表現
3. 重點時段分析（上半年/下半年）
4. 有利月份與需謹慎月份
5. 具體建議與注意事項`,
							userInfo: { birthDateTime: birthday, gender, concern, problem: question },
							analysisType: "2026流年詳解",
							locale: locale,
						}),
					}),

					// 4. Career Annual Analysis (總流年事業)
					fetch("/api/ai-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							prompt: `分析2026年${concern}運勢三大優勢：
生日：${birthday}
性別：${gender}

請提供：
01 優勢分析 - 座理/時機/做法
02 優勢分析 - 座理/時機/做法
03 優勢分析 - 座理/時機/做法`,
							userInfo: { birthDateTime: birthday, gender, concern, problem: question },
							analysisType: "總流年優勢",
							locale: locale,
						}),
					}),
				]);

				// Parse AI responses
				const [dayMasterRes, wealthRes, yearRes, careerRes] = await Promise.all(
					aiResponses.map(r => r.json())
				);

				console.log("✅ AI responses received:", {
					dayMaster: dayMasterRes.success,
					wealth: wealthRes.success,
					year: yearRes.success,
					career: careerRes.success,
				});

				// Extract clean content from AI responses
				const dayMasterContent = extractContent(dayMasterRes);
				const wealthContent = extractContent(wealthRes);
				const yearContent = extractContent(yearRes);
				const careerContent = extractContent(careerRes);

				// Structure AI-generated data with clean text
				const mockReportData = {
					bazi: baziData,
					dayMaster: {
						analysis: {
							// Use full content as each field - components will display them
							fullContent: dayMasterContent,
							strengths: dayMasterContent,
							weaknesses: dayMasterContent,
							strategies: dayMasterContent,
							suggestions: dayMasterContent,
						},
					},
					wealth: {
						analysis: {
							fullContent: wealthContent,
							position: wealthContent,
							characteristics: wealthContent,
							methods: wealthContent,
							keyAdvice: wealthContent,
						},
					},
					year: {
						analysis: {
							fullContent: yearContent,
							overview: yearContent,
							concernImpact: yearContent,
							favorablePeriods: "農曆二月、六月、十月",
							cautiousPeriods: "農曆四月、八月",
							keyReminder: yearContent,
						},
					},
					career: {
						analysis: {
							fullContent: careerContent,
							advantage1: careerContent,
							advantage2: careerContent,
							advantage3: careerContent,
						},
					},
					seasons: {
						seasons: {
							spring: {
								overview: `春季萬物復甦，生機盎然，是開展新計劃的好時機。`,
								concernFocus: `${concern}方面將有新的突破機會。`,
								advice: `積極主動，把握春季的生發之氣。`,
							},
							summer: {
								overview: `夏季火旺，能量充沛，適合大展身手。`,
								concernFocus: `${concern}運勢達到高峰。`,
								advice: `保持熱情，但也要注意適度休息。`,
							},
							autumn: {
								overview: `秋季收斂，是整理與沉澱的時期。`,
								concernFocus: `${concern}方面宜穩健經營。`,
								advice: `總結經驗，為下一階段做準備。`,
							},
							winter: {
								overview: `冬季蓄勢待發，養精蓄銳的時節。`,
								concernFocus: `${concern}進入調整期。`,
								advice: `休養生息，規劃來年。`,
							},
						},
					},
					jixiong: {
						auspicious: `• 人際關係和諧，貴人相助，事業發展順利\n• 財運亨通，投資理財有成，收入穩定增長\n• 身體健康，精神飽滿，心情愉悅\n• 感情美滿，夫妻和睦，家庭幸福`,
						inauspicious: `• 注意小人作祟，謹慎處理人際關係\n• 避免衝動投資，謹防財務損失\n• 注意身體健康，預防季節性疾病\n• 溝通需要耐心，避免感情摩擦`,
					},
					summary: {
						content: `2026年丙午年對您而言是充滿機遇與挑戰並存的一年。在${concern}方面，您將迎來重要的轉折點。憑藉您${baziData.dayMaster}日主的特質，只要把握時機，穩健前行，必將收穫豐碩成果。`,
						luckyColors: ["紅色", "金色", "紫色"],
						luckyAccessories: ["紅繩手鍊", "金屬飾品", "玉石吊墜"],
						quote: `順勢而為，把握機遇，2026年必將收穫滿滿。`,
						recommendations: [
							{
								title: "方位調整",
								tags: ["風水", "環境"],
								content: "根據您的八字，建議在2026年多往東南方位活動，有利於提升運勢。",
							},
							{
								title: "時機把握",
								tags: ["時間", "規劃"],
								content: "把握春季和夏季的有利時段，可以事半功倍。",
							},
							{
								title: "人際互動",
								tags: ["人脈", "關係"],
								content: "注意人際關係的經營，貴人相助將是今年的關鍵。",
							},
							{
								title: "自我提升",
								tags: ["學習", "成長"],
								content: "持續學習和提升自我能力，將為長遠發展打下基礎。",
							},
							{
								title: "健康調養",
								tags: ["養生", "保健"],
								content: "注意身心健康的平衡，適度運動與休息同樣重要。",
							},
						],
					},
					concern,
					gender,
					birthday,
					birthTime,
					question,
					color: concernColors[concern],
				};

				setReportData(mockReportData);
				setIsLoading(false);
			} catch (error) {
				console.error("Error generating report data:", error);
				setIsLoading(false);
			}
		};

		if (birthday && birthTime) {
			generateReportData();
		}
	}, [concern, gender, birthday, birthTime, question, locale]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-4"
						style={{ borderColor: concernColors[concern] }}
					></div>
					<p className="text-xl" style={{ color: concernColors[concern] }}>
						正在生成報告...
					</p>
				</div>
			</div>
		);
	}

	if (!reportData) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="text-center">
					<p className="text-xl text-red-600 mb-4">報告生成失敗</p>
					<button
						onClick={() => router.back()}
						className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
					>
						返回
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Control Bar (no-print) */}
			<div className="fixed top-0 left-0 right-0 bg-white border-b shadow-md z-50 no-print px-6 py-4 flex justify-between items-center">
				<div className="flex gap-4 items-center">
					<button
						onClick={() => router.back()}
						className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
					>
						返回
					</button>
					<h1 className="text-xl font-bold" style={{ color: reportData.color }}>
						{concern}報告 - 預覽模式
					</h1>
				</div>
				<button
					onClick={() => window.print()}
					className="px-6 py-2 text-white rounded-lg font-bold hover:shadow-lg"
					style={{ backgroundColor: reportData.color }}
				>
					列印報告
				</button>
			</div>

			{/* Print Report Content */}
			<div className="print-container bg-white pt-20">
				{/* Page 1: Basic Analysis (Four Pillars, Five Elements, Quote) */}
				<Page1_BasicAnalysis data={reportData} />

				{/* Page 2: Day Master Traits (4 boxes: 優勢/劣勢/調候/建議) */}
				<Page2_DayMasterTraits data={reportData} />

				{/* Page 3: Wealth Star Position (Financial analysis for 財運 concern) */}
				{concern === "財運" && <Page3_WealthPosition data={reportData} />}

				{/* Page 4: 2026 Year Overview (two-column layout) */}
				<Page4_2026Overview data={reportData} />

				{/* Page 5-6: Detailed Career/Concern Analysis (numbered sections) */}
				<Page5_6_CareerDetailed data={reportData} />

				{/* Page 7: Key Seasons (seasonal analysis with decorative characters) */}
				<Page7_KeySeasons data={reportData} />

				{/* Page 8-9: Recommendations (5 recommendation boxes) */}
				<Page8_9_Recommendations data={reportData} />

				{/* Page 10-11: My 2026 Summary (quote, colors, accessories) */}
				<Page10_11_MySummary data={reportData} />
			</div>

			{/* Print Styles */}
			<style jsx global>{`
				@media print {
					.no-print {
						display: none !important;
					}

					.print-container {
						padding-top: 0 !important;
					}

					.page-break {
						page-break-after: always;
					}

					.page-break-before {
						page-break-before: always;
					}

					.avoid-break {
						page-break-inside: avoid;
					}

					@page {
						size: A4;
						margin: 20mm;
					}

					body {
						print-color-adjust: exact;
						-webkit-print-color-adjust: exact;
					}
				}
			`}</style>
		</>
	);
}

export default function PrintReportViewPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PrintReportView />
		</Suspense>
	);
}
