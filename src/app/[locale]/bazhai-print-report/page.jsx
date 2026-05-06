"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { bazhaiPrintPages } from "./pageSettings";
import {
	buildBazhaiPrintSlots,
	chunkArray,
	DIRECTION_ZH,
	localizeDirectionText,
	parseOverallSections,
} from "./bazhaiPrintHelpers";
import PageCover from "./components/PageCover";
import PageMingZhaiMatch from "./components/PageMingZhaiMatch";
import PageLayoutAnalysis from "./components/PageLayoutAnalysis";
import PageRoomDetails from "./components/PageRoomDetails";
import PageOverallSummary from "./components/PageOverallSummary";
import PageYearlyReminders from "./components/PageYearlyReminders";
import PageConclusion from "./components/PageConclusion";
import BazhaiPrintStyles from "./components/BazhaiPrintStyles";

export default function BazhaiPrintReportPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
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
		[analysisData?.overallAnalysis],
	);
	const roomPages = useMemo(() => chunkArray(roomAnalyses, 2), [roomAnalyses]);
	const printSlots = useMemo(
		() => buildBazhaiPrintSlots(bazhaiPrintPages, roomPages),
		[roomPages],
	);
	const totalPages = printSlots.length;

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
				Number.isFinite(item.size.height),
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
				(i) => i.type === "furniture" || i._type === "furniture",
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
		const compassRotation = Number(analysisData?.designSummary?.compassRotation || 0);
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
		const birthDateTime = `${profile.birthYear}-${String(profile.birthMonth || 1).padStart(2, "0")}-${String(
			profile.birthDay || 1,
		).padStart(2, "0")} ${String(profile.birthHour ?? 12).padStart(2, "0")}:00`;
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

	const roomLabelLookup = useMemo(() => {
		const map = {};
		(normalizedLayout.rooms || []).forEach((room) => {
			const direction = room?.direction;
			const mingGroup = analysisData?.mingGuaInfo?.group;
			const bazhaiName = direction ? getBazhaiNameByGroup(mingGroup, direction) : "未定";
			const bazhaiFortune = direction ? getBazhaiFortuneByGroup(mingGroup, direction) : "未知";
			const star = direction ? flyingStars[direction] || flyingStars.center : flyingStars.center;
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

			const preparedData =
				sessionStorage.getItem("bazhaiPrintReadyData") ||
				localStorage.getItem("bazhaiPrintReadyData");
			if (preparedData) {
				try {
					const parsedPrepared = JSON.parse(preparedData);
					const isFresh = Date.now() - (parsedPrepared?.timestamp || 0) < 2 * 60 * 60 * 1000;
					if (isFresh && parsedPrepared?.analysisData) {
						setAnalysisData(parsedPrepared.analysisData);
						setLoading(false);
						return;
					}
				} catch (_e) {
					// fall through to original sessionStorage flow
				}
			}

			const storedData = sessionStorage.getItem("bazhaiAnalysisData");
			if (!storedData) {
				setError("找不到八宅分析資料，請先回到設計頁生成報告。");
				setLoading(false);
				return;
			}

			try {
				const { designData, userProfile, timestamp } = JSON.parse(storedData);
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
							compassRotation: dataWithDirections?.compassRotation || 0,
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
	}, [status, session?.user, router, locale, searchParams]);

	useEffect(() => {
		document.body.classList.add("print-report-view");
		return () => document.body.classList.remove("print-report-view");
	}, []);

	function renderPrintSlot(slot, index) {
		const pageNum = index + 1;
		const key =
			slot.kind === "roomDetails" ? `room-${slot.chunkIndex}` : slot.kind;

		switch (slot.kind) {
			case "cover":
				return (
					<PageCover key={key} analysisData={analysisData} locale={locale} />
				);
			case "mingZhaiMatch":
				return (
					<PageMingZhaiMatch
						key={key}
						analysisData={analysisData}
						personalCardData={personalCardData}
						personalTraitAnalysis={personalTraitAnalysis}
						houseDirectionInfo={houseDirectionInfo}
						mingZhaiResult={mingZhaiResult}
						pageNum={pageNum}
						totalPages={totalPages}
					/>
				);
			case "layoutAnalysis":
				return (
					<PageLayoutAnalysis
						key={key}
						normalizedLayout={normalizedLayout}
						roomLabelLookup={roomLabelLookup}
						starPanels={starPanels}
						pageNum={pageNum}
						totalPages={totalPages}
					/>
				);
			case "roomDetails":
				return (
					<PageRoomDetails
						key={key}
						rooms={slot.rooms}
						chunkIndex={slot.chunkIndex}
						mingGuaGroup={analysisData?.mingGuaInfo?.group}
						pageNum={pageNum}
						totalPages={totalPages}
					/>
				);
			case "overallSummary":
				return (
					<PageOverallSummary
						key={key}
						overallSections={overallSections}
						comprehensiveAdvice={analysisData?.comprehensiveAdvice}
						pageNum={pageNum}
						totalPages={totalPages}
					/>
				);
			case "yearlyReminders":
				return (
					<PageYearlyReminders
						key={key}
						yearlyAdvice={analysisData?.yearlyAdvice}
						pageNum={pageNum}
						totalPages={totalPages}
					/>
				);
			case "conclusion":
				return (
					<PageConclusion
						key={key}
						conclusionData={conclusionData}
						conciseCoreSummary={conciseCoreSummary}
						actionItems={actionItems}
						pageNum={pageNum}
						totalPages={totalPages}
					/>
				);
			default:
				return null;
		}
	}

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
				{printSlots.map((slot, index) => renderPrintSlot(slot, index))}
			</div>

			<BazhaiPrintStyles />
		</>
	);
}
