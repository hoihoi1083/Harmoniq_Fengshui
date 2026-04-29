"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import getRoomDirection from "../design/getRoomDirection";
import getWuxingData from "@/lib/nayin.js";
import {
	getFlyingStarsByYear,
	getBazhaiNameByGroup,
	getBazhaiFortuneByGroup,
} from "@/lib/bazhaiConfig";

const DIRECTION_ZH = {
	north: "正北",
	northEast: "東北",
	east: "正東",
	southEast: "東南",
	south: "正南",
	southWest: "西南",
	west: "正西",
	northWest: "西北",
	center: "中宮",
};

function localizeDirectionText(input) {
	if (!input) return input;
	const text = String(input);
	const replacements = [
		[/northEast/gi, "東北"],
		[/southEast/gi, "東南"],
		[/southWest/gi, "西南"],
		[/northWest/gi, "西北"],
		[/\bNorth East\b/gi, "東北"],
		[/\bSouth East\b/gi, "東南"],
		[/\bSouth West\b/gi, "西南"],
		[/\bNorth West\b/gi, "西北"],
		[/\bnorth\b/gi, "正北"],
		[/\bsouth\b/gi, "正南"],
		[/\beast\b/gi, "正東"],
		[/\bwest\b/gi, "正西"],
	];
	const normalized = replacements.reduce((acc, [pattern, value]) => acc.replace(pattern, value), text);
	return normalized.replace(/\(center\)|\bcenter\b/gi, "中心");
}

function parseOverallSections(analysis) {
	if (!analysis) return [];
	if (typeof analysis === "object") {
		return [
			analysis.overallAnalysis,
			analysis.personalMingGuaAnalysis,
			analysis.annualForecast,
		].filter(Boolean);
	}
	if (typeof analysis !== "string") return [];
	try {
		const matched = analysis.match(/\{[\s\S]*\}/);
		const parsed = JSON.parse(matched ? matched[0] : analysis);
		return [
			parsed.overallAnalysis,
			parsed.personalMingGuaAnalysis,
			parsed.annualForecast,
		].filter(Boolean);
	} catch {
		return [analysis];
	}
}

function parseRoomAI(aiText) {
	if (!aiText)
		return {
			yearSummary: "",
			recommendations: [],
			overallAdvice: "",
			personalAdvice: "",
			recommendationGroups: {
				furniture: [],
				colors: [],
				habits: [],
				items: [],
			},
		};
	try {
		const parsed =
			typeof aiText === "object"
				? aiText
				: JSON.parse((aiText.match(/\{[\s\S]*\}/) || [aiText])[0]);
		const rec = parsed?.recommendations || {};
		const recommendations = [
			...(rec.furniture || []),
			...(rec.colors || []),
			...(rec.habits || []),
			...(rec.items || []),
		].filter(Boolean);
		return {
			yearSummary: parsed?.yearSummary || "",
			recommendations,
			overallAdvice: parsed?.comprehensiveAdvice?.overall || "",
			personalAdvice: parsed?.comprehensiveAdvice?.personal || "",
			recommendationGroups: {
				furniture: rec.furniture || [],
				colors: rec.colors || [],
				habits: rec.habits || [],
				items: rec.items || [],
			},
		};
	} catch {
		return {
			yearSummary: String(aiText),
			recommendations: [],
			overallAdvice: "",
			personalAdvice: "",
			recommendationGroups: {
				furniture: [],
				colors: [],
				habits: [],
				items: [],
			},
		};
	}
}

function chunkArray(list, size) {
	const chunks = [];
	for (let i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
	return chunks;
}

export default function BazhaiPrintReportPage() {
	const router = useRouter();
	const locale = useLocale();
	const { data: session, status } = useSession();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [analysisData, setAnalysisData] = useState(null);

	const currentYear = new Date().getFullYear();
	const flyingStars = getFlyingStarsByYear(currentYear);
	const roomAnalyses = analysisData?.roomAnalyses || [];
	const overallSections = useMemo(
		() => parseOverallSections(analysisData?.overallAnalysis),
		[analysisData?.overallAnalysis]
	);
	const roomPages = useMemo(() => chunkArray(roomAnalyses, 2), [roomAnalyses]);
	const personalTraitAnalysis = useMemo(() => {
		const parsedSections = parseOverallSections(analysisData?.overallAnalysis);
		if (!parsedSections?.length) return "";
		return parsedSections[1] || parsedSections[0] || "";
	}, [analysisData?.overallAnalysis]);

	const normalizedLayout = useMemo(() => {
		const items = analysisData?.layoutItems || [];
		if (!items.length) return { rooms: [], furniture: [] };
		const valid = items.filter(
			(item) =>
				item?.position &&
				item?.size &&
				Number.isFinite(item.position.x) &&
				Number.isFinite(item.position.y) &&
				Number.isFinite(item.size.width) &&
				Number.isFinite(item.size.height)
		);
		if (!valid.length) return { rooms: [], furniture: [] };
		const minX = Math.min(...valid.map((i) => i.position.x));
		const minY = Math.min(...valid.map((i) => i.position.y));
		const maxX = Math.max(...valid.map((i) => i.position.x + Math.max(1, i.size.width)));
		const maxY = Math.max(...valid.map((i) => i.position.y + Math.max(1, i.size.height)));
		const width = Math.max(1, maxX - minX);
		const height = Math.max(1, maxY - minY);
		const normalized = valid.map((item, idx) => ({
			...item,
			_idx: idx,
			left: ((item.position.x - minX) / width) * 100,
			top: ((item.position.y - minY) / height) * 100,
			w: (Math.max(1, item.size.width) / width) * 100,
			h: (Math.max(1, item.size.height) / height) * 100,
		}));
		return {
			rooms: normalized.filter((i) => i.type === "room" || i._type === "room"),
			furniture: normalized.filter(
				(i) => i.type === "furniture" || i._type === "furniture"
			),
		};
	}, [analysisData?.layoutItems]);

	const luckyRows = useMemo(() => {
		const group = analysisData?.mingGuaInfo?.group || "西四命";
		const dirs = [
			"northEast",
			"east",
			"southEast",
			"south",
			"southWest",
			"west",
			"northWest",
			"north",
		];
		return dirs
			.map((direction) => {
				const star = flyingStars[direction] || flyingStars.center;
				const name = getBazhaiNameByGroup(group, direction);
				const fortune = getBazhaiFortuneByGroup(group, direction);
				return {
					name,
					directionZh: DIRECTION_ZH[direction] || direction,
					star: star?.star || "未知",
					fortune,
				};
			})
			.sort((a, b) => (a.fortune === "大吉" ? -1 : 1) - (b.fortune === "大吉" ? -1 : 1));
	}, [analysisData?.mingGuaInfo?.group, flyingStars]);

	const houseDirectionInfo = useMemo(() => {
		const compassRotation = Number(
			analysisData?.designSummary?.compassRotation || 0
		);
		const normalizedRotation = ((compassRotation % 360) + 360) % 360;
		const getDirectionFromRotation = (rotation) => {
			const normalized = ((rotation % 360) + 360) % 360;
			if (normalized >= 337.5 || normalized < 22.5)
				return { direction: "north", chinese: "正北" };
			if (normalized >= 22.5 && normalized < 67.5)
				return { direction: "northEast", chinese: "東北" };
			if (normalized >= 67.5 && normalized < 112.5)
				return { direction: "east", chinese: "正東" };
			if (normalized >= 112.5 && normalized < 157.5)
				return { direction: "southEast", chinese: "東南" };
			if (normalized >= 157.5 && normalized < 202.5)
				return { direction: "south", chinese: "正南" };
			if (normalized >= 202.5 && normalized < 247.5)
				return { direction: "southWest", chinese: "西南" };
			if (normalized >= 247.5 && normalized < 292.5)
				return { direction: "west", chinese: "正西" };
			return { direction: "northWest", chinese: "西北" };
		};

		const oppositeRotation = (normalizedRotation + 180) % 360;
		const sitDirection = getDirectionFromRotation(oppositeRotation);
		const faceDirection = getDirectionFromRotation(normalizedRotation);

		const houseTrigramMapping = {
			north: { group: "東四宅", name: "坎宅" },
			east: { group: "東四宅", name: "震宅" },
			southEast: { group: "東四宅", name: "巽宅" },
			south: { group: "東四宅", name: "離宅" },
			southWest: { group: "西四宅", name: "坤宅" },
			west: { group: "西四宅", name: "兌宅" },
			northWest: { group: "西四宅", name: "乾宅" },
			northEast: { group: "西四宅", name: "艮宅" },
		};

		const house = houseTrigramMapping[sitDirection.direction] || {
			group: "未知宅型",
			name: "未知宅",
		};
		const sitTrigram = houseTrigramMapping[sitDirection.direction] || {
			name: "未知宅",
		};
		const faceTrigram = houseTrigramMapping[faceDirection.direction] || {
			name: "未知宅",
		};
		const directionImageMap = {
			north: "North",
			northEast: "NorthEast",
			east: "East",
			southEast: "SouthEast",
			south: "South",
			southWest: "SouthWest",
			west: "West",
			northWest: "NorthWest",
		};

		return {
			sitDirection,
			faceDirection,
			houseGroup: house.group,
			houseName: house.name,
			compassRotation: Math.round(normalizedRotation),
			description: `正北${Math.round(normalizedRotation)}°`,
			sitTrigramName: sitTrigram.name,
			faceTrigramName: faceTrigram.name,
			directionImage: directionImageMap[faceDirection.direction] || "North",
		};
	}, [analysisData?.designSummary?.compassRotation]);

	const mingZhaiResult = useMemo(() => {
		const ownerGroup = analysisData?.mingGuaInfo?.group;
		const houseGroup = houseDirectionInfo.houseGroup;
		const isCompatible =
			(ownerGroup === "東四命" && houseGroup === "東四宅") ||
			(ownerGroup === "西四命" && houseGroup === "西四宅");
		return {
			isCompatible,
			text: isCompatible
				? "命卦與宅卦相配，屬於理想格局，可優先強化吉位空間。"
				: "命卦與宅卦不配，建議優先調整主活動空間與凶位化解。",
		};
	}, [analysisData?.mingGuaInfo?.group, houseDirectionInfo.houseGroup]);

	const personalCardData = useMemo(() => {
		const profile = analysisData?.userProfile || {};
		if (!profile?.birthYear) return null;
		const birthDateTime = `${profile.birthYear}-${String(
			profile.birthMonth || 1
		).padStart(2, "0")}-${String(profile.birthDay || 1).padStart(2, "0")} ${String(
			profile.birthHour ?? 12
		).padStart(2, "0")}:00`;
		const gender =
			profile.gender === "男" || profile.gender === "male" ? "male" : "female";
		try {
			const wuxing = getWuxingData(birthDateTime, gender);
			if (!wuxing) return null;
			const elementCounts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
			[
				wuxing.yearStemWuxing,
				wuxing.yearBranchWuxing,
				wuxing.monthStemWuxing,
				wuxing.monthBranchWuxing,
				wuxing.dayStemWuxing,
				wuxing.dayBranchWuxing,
				wuxing.hourStemWuxing,
				wuxing.hourBranchWuxing,
			].forEach((e) => {
				if (e && elementCounts[e] !== undefined) elementCounts[e] += 1;
			});
			return {
				pillars: [
					`年柱－${wuxing.year || "-"}`,
					`月柱－${wuxing.month || "-"}`,
					`日柱－${wuxing.day || "-"}`,
					`時柱－${wuxing.hour || "-"}`,
				],
				elementCounts,
				summary: `${wuxing.nayin || "納音"}；${analysisData?.mingGuaInfo?.name || ""}命，${
					analysisData?.mingGuaInfo?.group || ""
				}。`,
			};
		} catch {
			return null;
		}
	}, [analysisData?.userProfile, analysisData?.mingGuaInfo]);

	const totalPages = 6 + roomPages.length;
	const roomLabelLookup = useMemo(() => {
		const map = {};
		(normalizedLayout.rooms || []).forEach((room) => {
			const direction = room?.direction;
			const mingGroup = analysisData?.mingGuaInfo?.group;
			const bazhaiName = direction
				? getBazhaiNameByGroup(mingGroup, direction)
				: "未定";
			const bazhaiFortune = direction
				? getBazhaiFortuneByGroup(mingGroup, direction)
				: "未知";
			const star = direction
				? flyingStars[direction] || flyingStars.center
				: flyingStars.center;
			map[room.id || room._idx] = {
				directionZh: DIRECTION_ZH[direction] || "未標註",
				bazhaiName,
				bazhaiFortune,
				starName: star?.star || "未知",
				starType: star?.type || "凶",
			};
		});
		return map;
	}, [normalizedLayout.rooms, analysisData?.mingGuaInfo?.group, flyingStars]);
	const starPanels = useMemo(() => {
		const lucky = luckyRows.filter((row) => String(row.fortune || "").includes("吉")).slice(0, 4);
		const unlucky = luckyRows.filter((row) => !String(row.fortune || "").includes("吉")).slice(0, 4);
		return { lucky, unlucky };
	}, [luckyRows]);
	const conclusionData = useMemo(() => {
		const luckyCount = luckyRows.filter((row) => String(row.fortune || "").includes("吉")).length;
		const unluckyCount = Math.max(0, luckyRows.length - luckyCount);
		const compatibilityText = mingZhaiResult?.isCompatible
			? "命宅相配，整體格局基礎良好，可優先放大吉位優勢。"
			: "命宅不完全相配，建議先處理凶位干擾，再逐步強化吉位。";
		const mainSummary = parseOverallSections(analysisData?.overallAnalysis)[0] || "";
		const annualFocus = analysisData?.yearlyAdvice?.currentYear || "";
		const personalized = analysisData?.yearlyAdvice?.personalizedAdvice || "";
		return {
			luckyCount,
			unluckyCount,
			compatibilityText,
			mainSummary,
			annualFocus,
			personalized,
		};
	}, [luckyRows, mingZhaiResult, analysisData?.overallAnalysis, analysisData?.yearlyAdvice]);
	const conciseCoreSummary = useMemo(() => {
		const raw = localizeDirectionText(conclusionData.mainSummary || "");
		if (!raw) return "綜合摘要整理中...";
		const cleaned = raw.replace(/\s+/g, " ").trim();
		// Keep core section concise for visual balance
		return cleaned.length > 180 ? `${cleaned.slice(0, 180)}...` : cleaned;
	}, [conclusionData.mainSummary]);
	const actionItems = useMemo(() => {
		const annual = localizeDirectionText(conclusionData.annualFocus || "");
		const personal = localizeDirectionText(conclusionData.personalized || "");
		const items = [
			"先調整客廳與主臥的凶位干擾。",
			"提高吉位日常使用頻率。",
			"按流年做小步調整，不必一次大改。",
		];
		if (annual) items.push(`年度提醒：${annual.slice(0, 40)}${annual.length > 40 ? "..." : ""}`);
		if (personal) items.push(`個人建議：${personal.slice(0, 40)}${personal.length > 40 ? "..." : ""}`);
		return items.slice(0, 5);
	}, [conclusionData.annualFocus, conclusionData.personalized]);

	useEffect(() => {
		const run = async () => {
			if (status === "loading") return;
			if (!session?.user) {
				router.push(`/${locale}/auth/login`);
				return;
			}

			const storedData = sessionStorage.getItem("bazhaiAnalysisData");
			if (!storedData) {
				setError("找不到八宅分析資料，請先回到設計頁生成報告。");
				setLoading(false);
				return;
			}

			try {
				const { designData, userProfile, timestamp } =
					JSON.parse(storedData);
				const isDataFresh = Date.now() - timestamp < 60 * 60 * 1000;
				if (!isDataFresh || !designData || !userProfile) {
					setError("八宅分析資料已過期，請回到設計頁重新產生。");
					setLoading(false);
					return;
				}

				const dataWithDirections = getRoomDirection(designData);
				const rooms = (dataWithDirections?.localItems || [])
					.filter((item) => item.type === "room")
					.map((room) => ({
						...room,
						roomType: room.roomType || room.data?.type || room.type,
					}));

				const response = await fetch("/api/bazhai-analysis", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						rooms,
						userProfile,
						designSummary: {
							totalRooms: rooms.length,
							auspiciousRooms: 0,
							inauspiciousRooms: 0,
							compassRotation:
								dataWithDirections?.compassRotation || 0,
						},
					}),
				});
				const result = await response.json();
				if (!result?.success || !result?.data) {
					throw new Error(result?.error || "八宅分析失敗");
				}

				setAnalysisData({
					...result.data,
					layoutItems: dataWithDirections?.localItems || [],
				});
			} catch (err) {
				setError(err?.message || "載入列印版報告失敗");
			} finally {
				setLoading(false);
			}
		};

		run();
	}, [status, session?.user, router, locale]);

	useEffect(() => {
		document.body.classList.add("print-report-view");
		return () => document.body.classList.remove("print-report-view");
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen pt-20">
				<Navbar backgroundColor="ffffff" />
				<LoadingSpinner text="載入八宅列印版報告中..." />
			</div>
		);
	}

	if (error || !analysisData) {
		return (
			<div className="min-h-screen pt-20 bg-[#EFEFEF]">
				<Navbar backgroundColor="ffffff" />
				<div className="max-w-3xl p-6 mx-auto mt-10 bg-white rounded-2xl">
					<p className="mb-4 text-red-600">{error || "資料載入失敗"}</p>
					<button
						onClick={() => router.push(`/${locale}/design`)}
						className="px-4 py-2 text-white bg-gray-700 rounded-lg"
					>
						返回設計頁
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<Navbar backgroundColor="ffffff" />
			<div className="fixed top-16 left-0 right-0 z-[60] flex items-center justify-between w-full px-4 py-3 bg-white shadow-sm no-print">
				<h1 className="text-lg font-bold">八宅報告（列印版預覽）</h1>
				<div className="flex items-center gap-2">
					<button
						onClick={() => router.back()}
						className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
					>
						返回
					</button>
					<button
						onClick={() => window.print()}
						className="px-5 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
					>
						列印報告
					</button>
				</div>
			</div>

			<div className="print-report-pages bg-[#E5E7EB] py-8 px-4 min-h-screen mt-20">
				<div className="page-break cover-page bg-white relative">
					<div className="h-full p-[15mm] sm:p-[20mm] flex flex-col justify-between">
						<div>
							<p className="text-sm tracking-[0.2em] text-[#6B7280] mb-8">
								HARMONIQ FENG SHUI
							</p>
							<h1
								className="text-6xl font-black text-[#374A37] mb-5"
								style={{ fontFamily: "Noto Serif TC, serif" }}
							>
								八宅風水列印報告
							</h1>
							<p className="text-[18px] text-[#4B5563] leading-relaxed max-w-[80%]">
								本報告依據戶型布局、命卦與流年資料整理，分頁呈現關鍵結論與逐房建議，方便列印閱讀。
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="p-4 rounded-2xl bg-white border border-[#E5E7EB]">
								<p className="text-[#6B7280] mb-1">生成日期</p>
								<p className="font-semibold text-[#111827]">
									{new Date(
										analysisData.analysisDate
									).toLocaleDateString()}
								</p>
							</div>
							<div className="p-4 rounded-2xl bg-white border border-[#E5E7EB]">
								<p className="text-[#6B7280] mb-1">
									使用者命卦（命主）
								</p>
								<p className="font-semibold text-[#111827]">
									{analysisData?.mingGuaInfo?.name || "未提供"}
								</p>
								<p className="mt-1 text-xs text-[#6B7280]">
									命卦組別：
									{analysisData?.mingGuaInfo?.group || "未提供"}
								</p>
							</div>
						</div>
						<div className="mt-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#374151]">
							<div className="font-semibold mb-2">閱讀說明</div>
							<ul className="list-disc pl-5 space-y-1">
								<li>命卦：指使用者本命卦象（例如坎卦）。</li>
								<li>命卦組別：東四命或西四命，用於判斷吉凶方位。</li>
								<li>後續頁面已重排為列印版，移除互動標籤，強化閱讀順序。</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative">
					<h2 className="text-4xl font-bold text-[#374A37] mb-6" style={{ fontFamily: "Noto Serif TC, serif" }}>
						命卦與命宅匹配
					</h2>
					<div className="space-y-4">
						<div className="border border-gray-200 rounded-2xl p-5 personal-card-print page-two-personal">
							<div className="grid grid-cols-[100px_1fr] gap-4">
								<div
									className="text-[56px] leading-[1.05] font-bold text-[#A3B116] tracking-[0.05em]"
									style={{
										fontFamily: "Noto Serif TC, serif",
										writingMode: "vertical-rl",
										textOrientation: "upright",
									}}
								>
									個人命卦
								</div>
								<div>
									<div className="grid grid-cols-[120px_120px_1fr_96px] gap-2 items-center mb-3 personal-card-top">
										<div className="space-y-2">
											<div className="h-3 bg-[#99B99C] rounded-sm" />
											<div className="h-3 bg-[#99B99C] rounded-sm w-[80%]" />
											<div className="h-3 bg-[#99B99C] rounded-sm w-[70%]" />
										</div>
										<div className="text-[64px] leading-none font-bold text-black" style={{ fontFamily: "Noto Serif TC, serif" }}>
											{analysisData?.mingGuaInfo?.name || "未提供"}
										</div>
										<div className="space-y-2">
											<div className="grid grid-cols-2 gap-2">
												<div className="text-center py-1.5 bg-[#EFEFEF] rounded-full font-semibold text-sm">
													{analysisData?.userProfile?.gender || "未提供"}
												</div>
												<div className="text-center py-1.5 bg-[#EFEFEF] rounded-full font-semibold text-sm col-span-1">
													{analysisData?.userProfile?.birthYear
														? `${analysisData.userProfile.birthYear}年${analysisData.userProfile.birthMonth || ""}月${analysisData.userProfile.birthDay || ""}日`
														: "生日未提供"}
												</div>
											</div>
											<div className="text-center py-2.5 rounded-full bg-[#5E7E5E] text-white text-[42px] leading-none font-bold" style={{ fontFamily: "Noto Serif TC, serif" }}>
												{analysisData?.mingGuaInfo?.group || "未提供"}
											</div>
										</div>
										<div className="border border-[#A3B116] rounded-xl h-full flex flex-col items-center justify-center py-2 relative overflow-hidden">
											<div
												className="absolute inset-0 bg-no-repeat opacity-35"
												style={{
													backgroundImage: `url(/images/elements/${
														analysisData?.mingGuaInfo?.element || "水"
													}.png)`,
													backgroundSize: "62px 62px",
													backgroundPosition: "center 70%",
												}}
											/>
											<div className="text-[28px] font-bold text-[#374A37] relative z-10">五行</div>
											<div className="text-[64px] leading-none text-[#bcbcbc] relative z-10" style={{ fontFamily: "Noto Serif TC, serif" }}>
												{analysisData?.mingGuaInfo?.element || "－"}
											</div>
										</div>
									</div>
									<div className="border border-gray-200 rounded-full px-5 py-2 text-sm text-[#4B5563] flex items-center justify-between personal-elements-row">
										{["金", "木", "水", "火", "土"].map((el) => (
											<span key={el} className="inline-flex items-center gap-1.5">
												<img
													src={`/images/elements/${el}.png`}
													alt={el}
													className="w-4 h-4 object-contain opacity-70"
												/>
												{el} {personalCardData?.elementCounts?.[el] ?? "-"}
											</span>
										))}
									</div>
									<div className="grid grid-cols-4 gap-2 mt-3">
										{(personalCardData?.pillars || ["年柱－-", "月柱－-", "日柱－-", "時柱－-"]).map(
											(item) => (
												<div
													key={item}
													className="text-center py-1.5 bg-[#EFEFEF] rounded-full text-[26px] font-semibold leading-none"
													style={{ fontFamily: "Noto Serif TC, serif" }}
												>
													{item}
												</div>
											)
										)}
									</div>
									<div className="mt-3">
										<h4
											className="mb-2 text-[18px] text-black"
											style={{
												fontFamily: "Noto Sans HK",
												fontWeight: 500,
												WebkitTextStroke: "0.3px black",
											}}
										>
											個人特質分析
										</h4>
										<p className="text-[13px] leading-relaxed text-[#374151]">
											{personalTraitAnalysis ||
												personalCardData?.summary ||
												"分析資料載入中..."}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="border border-gray-200 rounded-2xl p-5 house-card-print">
							<div className="grid grid-cols-[74px_130px_1fr] gap-3 items-center">
								<div
									className="text-[52px] leading-[1.02] font-bold text-[#A3B116] tracking-[0.05em] text-center"
									style={{
										fontFamily: "Noto Serif TC, serif",
										writingMode: "vertical-rl",
										textOrientation: "upright",
									}}
								>
									宅卦
								</div>
								<div className="text-center">
									<img
										src={`/images/directions/${houseDirectionInfo.directionImage}.png`}
										alt={houseDirectionInfo.faceDirection.chinese}
										className="object-contain w-[96px] h-[96px] mx-auto"
										style={{ filter: "brightness(0)" }}
									/>
									<div className="mt-2 text-[22px] font-bold text-[#A3B116]" style={{ fontFamily: "Noto Serif TC, serif" }}>
										{houseDirectionInfo.description}
									</div>
								</div>
								<div>
									<div className="grid grid-cols-2 gap-2 mb-3">
										<div className="text-center py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
											坐：{houseDirectionInfo.sitDirection.chinese}-{houseDirectionInfo.sitTrigramName}
										</div>
										<div className="text-center py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
											向：{houseDirectionInfo.faceDirection.chinese}-{houseDirectionInfo.faceTrigramName}
										</div>
									</div>
									<div className="text-center py-3 rounded-full bg-[#A3B116] text-white text-[34px] font-bold" style={{ fontFamily: "Noto Serif TC, serif" }}>
										屬{houseDirectionInfo.houseName}（{houseDirectionInfo.houseGroup}）
									</div>
								</div>
							</div>
						</div>

						<div className="border border-gray-200 rounded-2xl p-5 mingzhai-card-print">
							<div className="grid grid-cols-[74px_1fr_1fr] gap-3 items-center">
								<div
									className="text-[52px] leading-[1.02] font-bold text-[#A3B116] tracking-[0.05em] text-center"
									style={{
										fontFamily: "Noto Serif TC, serif",
										writingMode: "vertical-rl",
										textOrientation: "upright",
									}}
								>
									命宅
								</div>
								<div className="col-span-2">
									<div className="grid grid-cols-3 gap-2 items-center mb-3">
										<div className="text-center">
											<div className="mb-2 text-[22px] font-bold text-[#374A37]" style={{ fontFamily: "Noto Serif TC, serif" }}>
												屋主
											</div>
											<div className="py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
												{analysisData?.mingGuaInfo?.group || "未提供"}
											</div>
										</div>
										<div className="text-center text-[34px] font-bold text-gray-400">VS</div>
										<div className="text-center">
											<div className="mb-2 text-[22px] font-bold text-[#374A37]" style={{ fontFamily: "Noto Serif TC, serif" }}>
												宅卦
											</div>
											<div className="py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
												{houseDirectionInfo.houseGroup}
											</div>
										</div>
									</div>
									<div
										className={`w-full text-center py-3 rounded-full font-bold mb-3 ${
											mingZhaiResult.isCompatible
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
										style={{ fontSize: "32px", fontFamily: "Noto Serif TC, serif" }}
									>
										{mingZhaiResult.isCompatible ? "✅ 命宅相配" : "⚠️ 命宅不配"}
									</div>
									<p className="text-[15px] leading-relaxed text-[#374151] font-semibold" style={{ fontFamily: "Noto Serif TC, serif" }}>
										{mingZhaiResult.isCompatible
											? `${analysisData?.userProfile?.gender === "男" ? "男主" : "女主"}命卦與宅卦相配，屬於理想的風水格局。此配置有利於整體運勢，建議延續現有布局並強化吉位能量。`
											: `${analysisData?.userProfile?.gender === "男" ? "男主" : "女主"}命卦與宅卦不相配，建議優先調整主活動空間，並加強吉位、化解凶位以改善整體風水。`}
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="absolute bottom-4 right-6 text-xs text-[#6B7280]">Page 2 / {totalPages}</div>
				</div>

				<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative">
					<h2 className="text-4xl font-bold text-[#374A37] mb-6" style={{ fontFamily: "Noto Serif TC, serif" }}>
						居室布局分析
					</h2>
					<div
						className="relative border border-gray-200 rounded-xl bg-[#FAFAFA] overflow-hidden"
						style={{ height: "122mm" }}
					>
						<div className="relative w-full h-full">
							{normalizedLayout.rooms.length === 0 && (
								<div className="absolute inset-0 flex items-center justify-center text-sm text-[#6B7280]">
									未偵測到可顯示的房間布局資料
								</div>
							)}
							{normalizedLayout.rooms.map((room) => (
								<div
									key={`room-${room.id || room._idx}`}
									className="absolute border border-[#8FA16E] bg-[#F3F8EB] z-20"
									style={{
										left: `${room.left}%`,
										top: `${room.top}%`,
										width: `${room.w}%`,
										height: `${room.h}%`,
									}}
								>
									<div className="absolute top-1 left-1 max-w-[58%] text-[10px] px-1 py-[1px] rounded bg-white/90 text-[#1F2937] truncate">
										{room.roomType || room.data?.label || "房間"}
									</div>
									<div className="absolute top-1 right-1 text-[9px] px-1 py-[1px] rounded bg-gray-800/80 text-white">
										{roomLabelLookup[room.id || room._idx]?.directionZh || "未標註"}
									</div>
									<div className="absolute bottom-1 left-1 right-1 z-30 flex flex-col gap-[2px]">
										<div className="w-fit max-w-full text-[9px] leading-tight px-1 py-[1px] rounded bg-white/95 text-[#1F2937] whitespace-normal break-words">
											<span
												className={`inline-block w-2 h-2 rounded-full mr-1 ${
													(roomLabelLookup[room.id || room._idx]?.bazhaiFortune || "").includes("吉")
														? "bg-[#22c55e]"
														: "bg-[#f43f5e]"
												}`}
											/>
											八宅：
											{roomLabelLookup[room.id || room._idx]?.bazhaiName || "未定"}
										</div>
										<div className="w-fit max-w-full text-[9px] leading-tight px-1 py-[1px] rounded bg-white/95 text-[#1F2937] whitespace-normal break-words">
											<span
												className={`inline-block w-2 h-2 rounded-full mr-1 ${
													roomLabelLookup[room.id || room._idx]?.starType === "吉"
														? "bg-[#3b82f6]"
														: "bg-[#7e22ce]"
												}`}
											/>
											流年：{roomLabelLookup[room.id || room._idx]?.starName || "未知"}
										</div>
									</div>
								</div>
							))}
							{normalizedLayout.furniture.map((item) => {
								const iconSrc =
									item.activeIcon ||
									item.data?.activeIcon ||
									item.data?.icon ||
									item.icon;
								if (!iconSrc) return null;
								return (
									<img
										key={`fur-${item.id || item._idx}`}
										src={iconSrc}
										alt={item.data?.label || "furniture"}
										className="absolute object-contain z-[25]"
										style={{
											left: `${item.left}%`,
											top: `${item.top}%`,
											width: `${Math.max(item.w, 1.8)}%`,
											height: `${Math.max(item.h, 1.8)}%`,
											transform:
												item.rotation != null
													? `rotate(${item.rotation}deg)`
													: "none",
											transformOrigin: "center",
										}}
									/>
								);
							})}
						</div>
					</div>
					<div className="mt-3 grid grid-cols-2 gap-3 text-[15px] text-[#1F2937]">
						<div className="rounded-2xl border border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
							<span className="font-semibold">八宅吉凶：</span>
							<span className="inline-flex items-center gap-2">
								<span className="w-4 h-4 rounded-full bg-[#22c55e] inline-block" />
								吉位
							</span>
							<span className="inline-flex items-center gap-2">
								<span className="w-4 h-4 rounded-full bg-[#f43f5e] inline-block" />
								凶位
							</span>
						</div>
						<div className="rounded-2xl border border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
							<span className="font-semibold">流年吉凶：</span>
							<span className="inline-flex items-center gap-2">
								<span className="w-4 h-4 rounded-full bg-[#3b82f6] inline-block" />
								吉星
							</span>
							<span className="inline-flex items-center gap-2">
								<span className="w-4 h-4 rounded-full bg-[#7e22ce] inline-block" />
								凶星
							</span>
						</div>
					</div>
					<div className="mt-3 grid grid-cols-1 gap-3 text-[13px]">
						<div className="rounded-2xl border border-gray-200 p-3 shadow-sm">
							<div className="text-[32px] font-bold text-[#6B7D00] mb-2" style={{ fontFamily: "Noto Serif TC, serif" }}>
								四吉位&流年飛星
							</div>
							<div className="space-y-1.5">
								{starPanels.lucky.map((row, idx) => (
									<div key={`lucky-${idx}`} className="grid grid-cols-[1.6fr_0.9fr_1.3fr_0.7fr] gap-1">
										<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#374A37] font-semibold">{row.name}</div>
										<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 text-center font-semibold text-[#374A37]">{row.directionZh}</div>
										<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#374A37] font-semibold">{row.star}</div>
										<div className="bg-[#A0B10F] text-white rounded-lg px-2 py-1 text-center font-bold">吉</div>
									</div>
								))}
							</div>
						</div>
						<div className="rounded-2xl border border-gray-200 p-3 shadow-sm">
							<div className="text-[32px] font-bold text-[#AF004A] mb-2" style={{ fontFamily: "Noto Serif TC, serif" }}>
								四凶位&流年飛星
							</div>
							<div className="space-y-1.5">
								{starPanels.unlucky.map((row, idx) => (
									<div key={`bad-${idx}`} className="grid grid-cols-[1.6fr_0.9fr_1.3fr_0.7fr] gap-1">
										<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#9B1C4D] font-semibold">{row.name}</div>
										<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 text-center font-semibold text-[#9B1C4D]">{row.directionZh}</div>
										<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#9B1C4D] font-semibold">{row.star}</div>
										<div className="bg-[#A0B10F] text-white rounded-lg px-2 py-1 text-center font-bold">凶</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="absolute bottom-4 right-6 text-xs text-[#6B7280]">Page 3 / {totalPages}</div>
				</div>

				{roomPages.map((rooms, idx) => (
					<div key={`room-page-${idx}`} className="page-break bg-white p-[15mm] sm:p-[20mm] relative">
						<h2 className="text-4xl font-bold text-[#374A37] mb-6" style={{ fontFamily: "Noto Serif TC, serif" }}>
							居室重點分析（第 {idx + 1} 頁）
						</h2>
						<div className="space-y-5">
							{rooms.map((room, i) => {
								const parsed = parseRoomAI(room.aiAnalysis);
								const directionZh = DIRECTION_ZH[room.direction] || localizeDirectionText(room.direction) || "未標註";
								const starName = room?.fengShuiData?.flyingStar || room?.fengShuiData?.star || "未知";
								const starType = room?.fengShuiData?.starType || room?.fengShuiData?.type || "凶";
								const roomName = room.roomType || "房間";
								const pillColor = starType === "吉" ? "#A3B116" : "#B4003C";
								const bazhaiName = getBazhaiNameByGroup(
									analysisData?.mingGuaInfo?.group || "西四命",
									room.direction
								);
								const bazhaiDesc = bazhaiName || "未定";
								const annualText = `流年：${starType === "吉" ? "吉星" : "凶星"}`;
								return (
									<div
										key={`room-${room.roomId || i}`}
										className="border border-gray-200 rounded-[22px] p-4"
										style={{
											boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
										}}
									>
										<div className="flex items-center justify-between gap-3 mb-2">
											<div
												className="text-[26px] font-bold text-[#374A37]"
												style={{ fontFamily: "Noto Serif TC, serif" }}
											>
												{roomName}
											</div>
											<div
												className="px-4 py-2 rounded-[18px] text-white font-bold text-[13px] leading-snug min-w-[280px]"
												style={{
													backgroundColor: pillColor,
													fontFamily: "Noto Serif TC, serif",
												}}
											>
												<div>{directionZh} ｜ {starName}</div>
												<div>八宅：{bazhaiDesc} ｜ {annualText}</div>
											</div>
										</div>

										<div className="px-1 mb-3">
											<h6 className="flex items-center mb-1 text-[14px] text-black">
												<span className="mr-2">🏠</span>
												整體格局分析
											</h6>
											<p className="leading-relaxed text-[#4B5563] text-[12px]">
												{localizeDirectionText(parsed.overallAdvice || parsed.yearSummary || "分析中...")}
											</p>
										</div>

										<div className="rounded-xl border border-[#E5E7EB] p-3">
											<div
												className="text-[20px] font-bold mb-2"
												style={{
													fontFamily: "Noto Serif TC, serif",
													color: starType === "吉" ? "#A3B116" : "#B4003C",
												}}
											>
												{starType === "吉" ? "強化建議" : "化解建議"}
											</div>
											<div className="grid grid-cols-2 gap-2">
												{[
													{
														title: starType === "吉" ? "家具擺放" : "環境調整",
														key: "furniture",
													},
													{
														title: starType === "吉" ? "元素色彩" : "擺件禁忌",
														key: "colors",
													},
													{
														title: starType === "吉" ? "生活習慣" : "行為禁忌",
														key: "habits",
													},
													{
														title: starType === "吉" ? "能量強化" : "化煞措施",
														key: "items",
													},
												].map((section) => {
													const list = parsed?.recommendationGroups?.[section.key] || [];
													return (
														<div key={section.key} className="rounded-lg bg-[#EFEFEF] border border-gray-200 p-2">
															<div
																className="inline-flex items-center justify-center px-2 py-[2px] rounded text-white text-[11px] font-semibold mb-1 min-w-[74px]"
																style={{
																	backgroundColor:
																		section.key === "items"
																			? "#A3B116"
																			: starType === "吉"
																				? "#A3B116"
																				: "#B4003C",
																}}
															>
																{section.title}
															</div>
															<div className="text-[12px] leading-relaxed text-[#374151]">
																{localizeDirectionText(list.length > 0 ? list[0] : "暫無建議")}
															</div>
														</div>
													);
												})}
											</div>
										</div>
										<div className="mt-3 rounded-xl border border-[#CFE8D1] bg-[#F4FBF5] p-3">
											<h6 className="flex items-center mb-1 text-[14px] text-[#2F5D35] font-semibold">
												<span className="mr-2">👤</span>
												個人化建議
											</h6>
											<p className="text-[12px] leading-relaxed text-[#2F5D35]">
												{localizeDirectionText(
													parsed.personalAdvice || "暫無個人化建議，請依命卦與宅卦整體配置優先調整。"
												)}
											</p>
										</div>
									</div>
								);
							})}
						</div>
						<div className="absolute bottom-4 right-6 text-xs text-[#6B7280]">
							Page {idx + 4} / {totalPages}
						</div>
					</div>
				))}

				<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative">
					<h2 className="text-4xl font-bold text-[#374A37] mb-6" style={{ fontFamily: "Noto Serif TC, serif" }}>
						綜合分析摘要
					</h2>
					<div className="space-y-4">
						{overallSections.map((text, idx) => (
							<div key={`overall-${idx}`} className="border border-gray-200 rounded-xl p-4">
								<p className="text-sm leading-relaxed text-[#374151]">{localizeDirectionText(text)}</p>
							</div>
						))}
						{analysisData?.comprehensiveAdvice && (
							<div className="border border-gray-200 rounded-xl p-4">
								<p className="text-sm leading-relaxed text-[#374151]">
									{localizeDirectionText(analysisData.comprehensiveAdvice)}
								</p>
							</div>
						)}
					</div>
					<div className="absolute bottom-4 right-6 text-xs text-[#6B7280]">
						Page {totalPages - 1} / {totalPages}
					</div>
				</div>

				<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative">
					<h2 className="text-4xl font-bold text-[#374A37] mb-6" style={{ fontFamily: "Noto Serif TC, serif" }}>
						流年提醒（2026年起，下元九運）
					</h2>
					<div className="space-y-4">
						<div className="rounded-xl p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100">
							<div className="font-bold text-red-700 mb-2 text-[18px]">2026年度重點提醒</div>
							<p className="text-sm leading-relaxed text-[#374151]">
								{localizeDirectionText(analysisData?.yearlyAdvice?.currentYear || "分析中...")}
							</p>
						</div>
						<div className="rounded-xl p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
							<div className="font-bold text-blue-700 mb-2 text-[18px]">下元九運影響</div>
							<p className="text-sm leading-relaxed text-[#374151]">
								{localizeDirectionText(analysisData?.yearlyAdvice?.nineStarCycle || "分析中...")}
							</p>
						</div>
						<div className="rounded-xl p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100">
							<div className="font-bold text-yellow-700 mb-2 text-[18px]">個人化年度建議</div>
							<p className="text-sm leading-relaxed text-[#374151]">
								{localizeDirectionText(analysisData?.yearlyAdvice?.personalizedAdvice || "分析中...")}
							</p>
						</div>
					</div>
					<div className="absolute bottom-4 right-6 text-xs text-[#6B7280]">Page {totalPages} / {totalPages}</div>
				</div>

				<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative">
					<h2 className="text-4xl font-bold text-[#374A37] mb-6" style={{ fontFamily: "Noto Serif TC, serif" }}>
						結論
					</h2>
					<div className="space-y-4">
						<div className="rounded-2xl p-5 bg-gradient-to-r from-[#EEF8D8] via-[#F7FDEB] to-[#E8F7EF] border border-[#DDE7CC]">
							<div className="text-[22px] font-bold text-[#374A37] mb-2">你的家，正在往更好的方向前進</div>
							<p className="text-sm leading-relaxed text-[#374151]">
								{localizeDirectionText(conclusionData.compatibilityText)}
							</p>
							<p className="text-sm leading-relaxed text-[#374151] mt-2">
								目前吉位 {conclusionData.luckyCount} 處、凶位 {conclusionData.unluckyCount} 處。只要按節奏優先調整，整體居住體感與穩定度會逐步上升。
							</p>
						</div>
						<div className="grid grid-cols-2 gap-3 items-stretch">
							<div className="rounded-xl p-4 border border-[#F3DDB8] bg-[#FFF9EE] h-full">
								<div className="font-bold text-[#9A6A00] mb-2">✨ 核心重點</div>
								<p className="text-sm leading-relaxed text-[#374151]">
									{conciseCoreSummary}
								</p>
							</div>
							<div className="rounded-xl p-4 border border-[#D6E7F9] bg-[#F4F9FF] h-full">
								<div className="font-bold text-[#235A96] mb-2">🧭 下一步行動</div>
								<ol className="list-decimal pl-5 space-y-1 text-sm text-[#374151]">
									{actionItems.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ol>
							</div>
						</div>
						<div className="rounded-xl p-4 border border-[#E7D4F9] bg-[#FBF6FF]">
							<div className="font-bold text-[#6E3FA8] mb-2">💬 年度與個人提醒</div>
							<p className="text-sm leading-relaxed text-[#374151] mb-2">
								{localizeDirectionText(conclusionData.annualFocus || "年度重點整理中...")}
							</p>
							<p className="text-sm leading-relaxed text-[#374151]">
								{localizeDirectionText(conclusionData.personalized || "個人化建議整理中...")}
							</p>
						</div>
					</div>
					<div className="absolute bottom-4 right-6 text-xs text-[#6B7280]">
						Page {totalPages} / {totalPages}
					</div>
				</div>
			</div>

			<style jsx global>{`
				@media print {
					.no-print,
					nav {
						display: none !important;
					}
					@page {
						size: A4;
						margin: 0;
					}
					body {
						margin: 0 !important;
						padding: 0 !important;
						background: white !important;
						print-color-adjust: exact !important;
						-webkit-print-color-adjust: exact !important;
					}
					.print-report-pages {
						background: white !important;
						padding: 0 !important;
						margin: 0 !important;
					}
					.cover-page {
						page-break-after: always;
						width: 210mm !important;
						height: 297mm !important;
						margin: 0 !important;
						box-shadow: none !important;
						border: none !important;
					}
					.page-break {
						page-break-after: always;
						page-break-inside: avoid;
						width: 210mm !important;
						min-height: 297mm !important;
						margin: 0 !important;
						box-shadow: none !important;
						border: none !important;
						border-radius: 0 !important;
						overflow: hidden !important;
					}
					.personal-card-print {
						padding: 14px !important;
					}
					.personal-card-print .personal-card-top {
						grid-template-columns: 92px 98px 1fr 84px !important;
						gap: 6px !important;
					}
					.personal-card-print .text-\[56px\] {
						font-size: 46px !important;
					}
					.personal-card-print .text-\[64px\] {
						font-size: 50px !important;
					}
					.personal-card-print .text-\[42px\] {
						font-size: 34px !important;
					}
					.personal-card-print .text-\[28px\] {
						font-size: 22px !important;
					}
					.personal-card-print .text-\[26px\] {
						font-size: 20px !important;
					}
					.personal-card-print .personal-elements-row {
						font-size: 12px !important;
						padding-top: 6px !important;
						padding-bottom: 6px !important;
					}
					.personal-card-print .personal-elements-row img {
						width: 12px !important;
						height: 12px !important;
					}
					.page-two-personal .text-\[13px\] {
						font-size: 12px !important;
						line-height: 1.45 !important;
					}
					.house-card-print .text-\[52px\] {
						font-size: 42px !important;
					}
					.house-card-print .w-\[96px\] {
						width: 80px !important;
					}
					.house-card-print .h-\[96px\] {
						height: 80px !important;
					}
					.house-card-print .text-\[34px\] {
						font-size: 28px !important;
					}
					.house-card-print .text-\[22px\] {
						font-size: 18px !important;
					}
					.house-card-print .text-\[18px\] {
						font-size: 15px !important;
					}
					.mingzhai-card-print .text-\[52px\] {
						font-size: 42px !important;
					}
					.mingzhai-card-print .text-\[34px\] {
						font-size: 28px !important;
					}
					.mingzhai-card-print .text-\[32px\] {
						font-size: 26px !important;
					}
					.mingzhai-card-print .text-\[22px\] {
						font-size: 18px !important;
					}
					.mingzhai-card-print .text-\[18px\] {
						font-size: 15px !important;
					}
					.mingzhai-card-print .text-\[15px\] {
						font-size: 12px !important;
						line-height: 1.45 !important;
					}
				}
				@media screen {
					.cover-page {
						width: 210mm;
						height: 297mm;
						margin: 0 auto 20px;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
						border: 1px solid #d1d5db;
						box-sizing: border-box;
						background: white;
					}
					.page-break {
						width: 210mm;
						min-height: 297mm;
						margin: 0 auto 20px;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
						border: 1px solid #d1d5db;
						box-sizing: border-box;
						background: white;
					}
					.page-two-personal .text-\[13px\] {
						font-size: 13px;
						line-height: 1.6;
					}
				}
			`}</style>
		</>
	);
}
