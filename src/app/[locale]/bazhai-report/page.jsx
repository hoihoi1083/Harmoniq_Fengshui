"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BazhaiCompass from "@/components/bazhai/BazhaiCompass";
import MingGuaInfo from "@/components/bazhai/MingGuaInfo";
import RoomBazhaiCard from "@/components/bazhai/RoomBazhaiCard";
import OverallBazhaiAnalysis from "@/components/bazhai/OverallBazhaiAnalysis";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import getRoomDirection from "../design/getRoomDirection";
import { ROOM_TYPES, ROOM_TYPES_LABEL_TW } from "@/types/room";
import ShopNavbar from "@/components/ShopNavbar";
import Footer from "@/components/home/Footer";

const ROOM_TYPE_MAPPING = {
	[ROOM_TYPES.LIVING_ROOM]: "客廳",
	[ROOM_TYPES.BEDROOM]: "臥室",
	[ROOM_TYPES.DINING_ROOM]: "餐廳",
	[ROOM_TYPES.KITCHEN]: "廚房",
	[ROOM_TYPES.BATHROOM]: "浴室",
	[ROOM_TYPES.STUDY_ROOM]: "書房",
	[ROOM_TYPES.STORAGE_ROOM]: "儲物房",
	[ROOM_TYPES.BALCONY]: "陽台",
	[ROOM_TYPES.GARDEN]: "花園",
	[ROOM_TYPES.GARAGE]: "車庫",
	[ROOM_TYPES.CORRIDOR]: "走廊",
	// English fallbacks
	living_room: "客廳",
	bedroom: "臥室",
	dining_room: "餐廳",
	kitchen: "廚房",
	bathroom: "浴室",
	study_room: "書房",
	storage_room: "儲物房",
	balcony: "陽台",
	garden: "花園",
	garage: "車庫",
	corridor: "走廊",
};

export default function BazhaiReportPage() {
	const [analysisData, setAnalysisData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showJsonModal, setShowJsonModal] = useState(false);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: session, status } = useSession();

	// Check if required libraries are available
	const checkLibraries = () => {
		try {
			if (
				typeof jsPDF === "undefined" ||
				typeof html2canvas === "undefined"
			) {
				console.warn("⚠️ PDF libraries not properly loaded");
				return false;
			}
			return true;
		} catch (e) {
			console.warn("⚠️ Error checking PDF libraries:", e);
			return false;
		}
	};

	useEffect(() => {
		// Wait for session to load
		if (status === "loading") {
			console.log("Waiting for session to load...");
			return;
		}

		// First try to get data from sessionStorage
		const storedData = sessionStorage.getItem("bazhaiAnalysisData");

		if (storedData) {
			try {
				const { designData, userProfile, timestamp } =
					JSON.parse(storedData);

				// Check if data is not too old (within 1 hour)
				const isDataFresh = Date.now() - timestamp < 60 * 60 * 1000;

				if (isDataFresh && designData && userProfile) {
					console.log("✅ Using data from sessionStorage:", {
						designData: designData,
						userProfile: userProfile,
					});

					performBazhaiAnalysis(designData, userProfile);

					// Clear the data after use
					sessionStorage.removeItem("bazhaiAnalysisData");
					return;
				}
			} catch (err) {
				console.error("❌ SessionStorage parsing error:", err);
			}
		}

		// Fallback: try URL parameters (for backward compatibility)
		const designDataParam = searchParams.get("designData");
		const userProfileParam = searchParams.get("userProfile");

		console.log("🔍 Bazhai Report Page - URL Params:", {
			designDataParam: designDataParam ? "Found" : "Missing",
			userProfileParam: userProfileParam ? "Found" : "Missing",
		});

		if (designDataParam && userProfileParam) {
			try {
				const designData = JSON.parse(
					decodeURIComponent(designDataParam)
				);
				const userProfile = JSON.parse(
					decodeURIComponent(userProfileParam)
				);

				console.log("✅ Parsed data successfully from URL:", {
					designData: designData,
					userProfile: userProfile,
				});

				performBazhaiAnalysis(designData, userProfile);
			} catch (err) {
				setError("數據解析失敗");
				console.error("❌ URL parsing error:", err);
			}
		} else {
			console.log("❌ No data found in sessionStorage or URL parameters");
			// Try to perform analysis with localStorage data
			console.log("🔄 Attempting to perform analysis with current data");
			performBazhaiAnalysis();
		}
	}, [searchParams, status]);

	const performBazhaiAnalysis = async (
		providedDesignData = null,
		providedUserProfile = null
	) => {
		try {
			// Wait for session to load
			if (status === "loading") {
				console.log("Session still loading, waiting...");
				return;
			}

			if (!session?.user) {
				console.log("No session found, redirecting to login");
				router.push("/auth/login");
				return;
			}

			console.log("User session found:", session.user);
			setLoading(true);

			let designData = providedDesignData;
			let currentUserProfile = providedUserProfile;

			// If no provided data, get from localStorage
			if (!designData) {
				const designDataRaw = localStorage.getItem("designData");
				console.log(
					"Raw design data from localStorage:",
					designDataRaw
				);

				if (!designDataRaw) {
					console.log(
						"❌ No design data found, redirecting to design page"
					);
					setError("請先在設計頁面建立平面圖後再進行八宅分析");
					setLoading(false);
					// Redirect to design page after showing error
					setTimeout(() => {
						router.push("/design");
					}, 3000);
					return;
				}

				try {
					designData = JSON.parse(designDataRaw);
				} catch (parseError) {
					console.error("❌ Error parsing design data:", parseError);
					setError("設計資料格式錯誤，請重新建立平面圖");
					setLoading(false);
					setTimeout(() => {
						router.push("/design");
					}, 3000);
					return;
				}
			}

			console.log("Using design data:", designData);
			console.log("Parsed design data:", designData);
			console.log("Design data keys:", Object.keys(designData));
			console.log("LocalItems type check:", typeof designData.localItems);
			console.log("LocalItems length:", designData.localItems?.length);

			// Calculate room directions
			const dataWithDirections = getRoomDirection(designData);
			console.log("Data with room directions:", dataWithDirections);
			console.log(
				"DataWithDirections keys:",
				Object.keys(dataWithDirections)
			);
			console.log(
				"DataWithDirections localItems length:",
				dataWithDirections.localItems?.length
			);

			// Let's examine the structure of localItems
			if (
				dataWithDirections.localItems &&
				dataWithDirections.localItems.length > 0
			) {
				console.log(
					"First few localItems:",
					dataWithDirections.localItems.slice(0, 3)
				);
				console.log(
					"All item types in localItems:",
					dataWithDirections.localItems.map((item) => item.type)
				);

				const roomItems = dataWithDirections.localItems.filter(
					(item) => item.type === "room"
				);
				console.log('Items with type "room":', roomItems);
				console.log("Room items count:", roomItems.length);

				// Debug each room item
				roomItems.forEach((room, index) => {
					console.log(`Room ${index + 1}:`, {
						type: room.type,
						roomType: room.roomType,
						direction: room.direction,
						hasDirection: !!room.direction,
						isNotCenter: room.direction !== "center",
						hasRoomType: !!room.roomType,
						fullRoom: room,
					});
				});
			}

			// Extract rooms from localItems with detailed filtering
			console.log("Starting room filtering...");
			const allItems = dataWithDirections.localItems || [];
			console.log("Total items to filter:", allItems.length);

			// Ensure we have valid items before filtering
			if (!allItems || allItems.length === 0) {
				throw new Error("No items found in localItems");
			}

			const step1 = allItems.filter((item) => item.type === "room");
			console.log('Step 1 - Items with type "room":', step1.length);

			// Ensure step1 is defined before using it
			if (!step1) {
				throw new Error("step1 filtering failed");
			}

			const step2 = step1.filter((item) => item.direction);
			console.log("Step 2 - Items with direction:", step2.length);

			// Modified Step 3: Keep center rooms if they are living rooms or other important rooms
			const step3 = step2.filter((item) => {
				if (item.direction === "center") {
					// Allow center rooms for living rooms, dining rooms, and other main areas
					const roomId = item.id || "";
					const isImportantCenterRoom =
						roomId.includes("living_room") ||
						roomId.includes("dining_room") ||
						roomId.includes("family_room");

					if (isImportantCenterRoom) {
						console.log(
							`🎯 Keeping center room as important: ${roomId}`
						);
						// Assign a default direction for center rooms (usually considered as the heart of the home)
						item.direction = "center"; // Keep as center but don't filter out
						return true;
					}
					return false;
				}
				return item.direction !== "center";
			});
			console.log(
				"Step 3 - Items not center (except important center rooms):",
				step3.length
			);

			// Map room data to ensure roomType is properly set
			const mappedRooms = step3.map((item) => {
				// Multiple fallbacks for roomType extraction
				const rawRoomType =
					item.roomType ||
					item.data?._type ||
					item.data?.type ||
					item.type;

				// Map the room type to Chinese name
				let roomType =
					ROOM_TYPE_MAPPING[rawRoomType] ||
					ROOM_TYPES_LABEL_TW[rawRoomType] ||
					rawRoomType;

				// Final fallback
				if (!roomType || roomType === "room") {
					roomType = "房間";
				}

				console.log("🗺️ Mapping room:", {
					originalItem: item,
					rawRoomType: rawRoomType,
					mappedRoomType: roomType,
					itemRoomType: item.roomType,
					dataType: item.data?._type,
					dataTypeField: item.data?.type,
					itemType: item.type,
					isLivingRoom:
						rawRoomType === "living_room" ||
						rawRoomType === ROOM_TYPES.LIVING_ROOM,
					finalIsLivingRoom: roomType === "客廳",
				});

				return {
					...item,
					roomType: roomType,
				};
			});

			const step4 = mappedRooms.filter(
				(item) => item.roomType && item.roomType !== "房間"
			);
			console.log("Step 4 - Items with valid roomType:", step4.length);
			console.log(
				"Step 4 - Filtered room types:",
				step4.map((room) => room.roomType)
			);

			// Check specifically for living rooms
			const livingRooms = mappedRooms.filter(
				(room) =>
					room.roomType === "客廳" ||
					room.rawRoomType === "living_room" ||
					room.rawRoomType === ROOM_TYPES.LIVING_ROOM
			);
			console.log(
				"🏠 Living rooms found:",
				livingRooms.length,
				livingRooms.map((r) => ({
					roomType: r.roomType,
					direction: r.direction,
					id: r.id,
				}))
			);

			// If no rooms have specific roomType, use all rooms with generic fallback
			let rooms = step4;
			if (rooms.length === 0 && mappedRooms.length > 0) {
				console.log(
					"⚠️ No rooms with specific roomType found, using all rooms with fallback"
				);
				rooms = mappedRooms;
			}

			console.log("Filtered rooms for analysis:", rooms);
			console.log("Rooms count:", rooms.length);

			if (!rooms.length) {
				throw new Error("No rooms found in the design");
			}

			// Get user profile for personalized analysis
			let userProfile = currentUserProfile;
			if (!userProfile) {
				userProfile = {
					mingGua: session.user.mingGua || 1,
					gender: session.user.gender || "male",
					birthYear: session.user.birthYear || 1990,
				};
			}

			console.log("User profile for analysis:", userProfile);

			// Call the API for analysis
			const response = await fetch("/api/bazhai-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					rooms,
					userProfile,
					designSummary: {
						compassRotation: designData.compassRotation || 0,
					},
				}),
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result = await response.json();
			console.log("API response:", result);

			if (result.success && result.data) {
				setAnalysisData(result.data);
			} else {
				throw new Error("No analysis data received from API");
			}
		} catch (error) {
			console.error("Bazhai analysis error:", error);

			let errorMessage = "分析過程發生錯誤";
			let shouldRedirect = false;

			if (error.message === "No design data found") {
				errorMessage = "請先在設計頁面建立平面圖後再進行八宅分析";
				shouldRedirect = true;
			} else if (error.message.includes("parsing")) {
				errorMessage = "設計資料格式錯誤，請重新建立平面圖";
				shouldRedirect = true;
			} else if (error.message.includes("API")) {
				errorMessage = "分析服務暫時無法使用，請稍後再試";
			} else {
				errorMessage = error.message || "分析失敗，請重新嘗試";
			}

			setError(errorMessage);

			if (shouldRedirect) {
				setTimeout(() => {
					router.push("/design");
				}, 3000);
			}
		} finally {
			setLoading(false);
		}
	};

	const downloadReportAsPDF = async () => {
		if (!analysisData) {
			alert("沒有可下載的報告數據");
			return;
		}

		// Check if PDF libraries are available
		if (!checkLibraries()) {
			const useAlternative = confirm(
				"PDF生成工具未正確載入。\n\n是否改用列印功能生成PDF？\n" +
					"（在列印對話框中選擇「另存為PDF」）"
			);

			if (useAlternative) {
				handlePrintToPDF();
			}
			return;
		}

		setIsGeneratingPDF(true);
		console.log("🔄 開始生成PDF...");

		try {
			// Get the report content element
			const reportContent = document.getElementById("report-content");
			if (!reportContent) {
				console.error("❌ Report content element not found");
				throw new Error("找不到報告內容元素，請確保頁面已完全載入");
			}

			console.log("📄 找到報告內容元素:", {
				width: reportContent.scrollWidth,
				height: reportContent.scrollHeight,
			});

			// Hide buttons temporarily for PDF generation
			const buttonsContainer = document.querySelector(".no-print");
			if (buttonsContainer) {
				buttonsContainer.style.display = "none";
			}

			// Wait a moment for UI changes
			await new Promise((resolve) => setTimeout(resolve, 100));

			console.log("🖼️ 開始截圖...");
			// Configure html2canvas options for better quality and compatibility
			const canvas = await html2canvas(reportContent, {
				scale: 1.5, // Reduced scale for better performance
				useCORS: true,
				allowTaint: false,
				backgroundColor: "#ffffff",
				width: reportContent.scrollWidth,
				height: reportContent.scrollHeight,
				scrollX: 0,
				scrollY: 0,
				logging: false, // Disable logging to avoid noise
				imageTimeout: 15000, // 15 second timeout for images
				onclone: function (clonedDoc) {
					// Ensure fonts are loaded in cloned document
					const clonedElement =
						clonedDoc.getElementById("report-content");
					if (clonedElement) {
						clonedElement.style.fontFamily = "Arial, sans-serif";
					}
				},
			});

			console.log("✅ 截圖完成:", {
				canvasWidth: canvas.width,
				canvasHeight: canvas.height,
			});

			// Show buttons again
			if (buttonsContainer) {
				buttonsContainer.style.display = "";
			}

			console.log("📋 開始創建PDF...");
			// Calculate PDF dimensions
			const imgWidth = 210; // A4 width in mm
			const pageHeight = 295; // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;

			console.log("📐 PDF尺寸計算:", {
				imgWidth,
				imgHeight,
				pageHeight,
				totalPages: Math.ceil(imgHeight / pageHeight),
			});

			// Create PDF with proper configuration
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
				compress: true,
			});

			// Add title page info
			const fileName = `八宅風水報告_${analysisData.mingGuaInfo.name}_${new Date().toISOString().split("T")[0]}`;

			console.log("🖼️ 添加圖片到PDF...");
			let position = 0;

			// Convert canvas to high quality image
			const imgData = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG with 80% quality for smaller file size

			// Add the canvas image to PDF
			pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			// Add new pages if content is longer than one page
			let pageCount = 1;
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pageCount++;
				console.log(`📄 添加第${pageCount}頁...`);
				pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			console.log(`💾 保存PDF: ${fileName}.pdf`);
			// Save the PDF
			pdf.save(`${fileName}.pdf`);

			console.log("✅ PDF生成成功!");
		} catch (error) {
			console.error("❌ PDF generation failed:", error);

			// More specific error messages
			let errorMessage = "PDF生成失敗：";
			if (error.message.includes("Report content not found")) {
				errorMessage += "找不到報告內容";
			} else if (error.message.includes("html2canvas")) {
				errorMessage += "頁面截圖失敗，請檢查網路連接";
			} else if (error.message.includes("jsPDF")) {
				errorMessage += "PDF創建失敗";
			} else {
				errorMessage += error.message || "未知錯誤";
			}

			errorMessage +=
				"\n\n解決方案：\n1. 請重新整理頁面後再試\n2. 確保瀏覽器支援PDF下載\n3. 檢查是否有彈出視窗被阻擋\n4. 您也可以點擊「列印報告」按鈕另存為PDF";

			// Show error with option to try print instead
			const useAlternative = confirm(
				errorMessage + "\n\n是否改用列印功能生成PDF？"
			);

			if (useAlternative) {
				try {
					// Use browser's print dialog as fallback
					window.print();
				} catch (printError) {
					console.error("❌ Print fallback also failed:", printError);
					alert(
						"列印功能也無法使用，請嘗試重新整理頁面或聯繫技術支援"
					);
				}
			}
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	// Alternative PDF generation using browser print
	const handlePrintToPDF = () => {
		// Add print-specific styles
		const printStyles = document.createElement("style");
		printStyles.textContent = `
            @media print {
                .no-print { display: none !important; }
                body { font-size: 12pt; }
                h1 { font-size: 18pt; }
                h2 { font-size: 16pt; }
                h3 { font-size: 14pt; }
                .shadow-lg, .shadow-md { box-shadow: none !important; border: 1px solid #ccc; }
                .bg-gradient-to-br { background: white !important; }
                * { color: black !important; }
            }
        `;
		document.head.appendChild(printStyles);

		// Trigger print
		window.print();

		// Clean up
		setTimeout(() => {
			document.head.removeChild(printStyles);
		}, 1000);
	};

	const downloadJsonData = () => {
		if (!analysisData) return;

		const reportData = {
			...analysisData,
			downloadTime: new Date().toISOString(),
			note: "此為八宅風水分析的原始JSON數據，包含DeepSeek AI的完整回應",
		};

		const blob = new Blob([JSON.stringify(reportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `八宅風水分析數據_${analysisData.mingGuaInfo.name}_${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const showJsonData = () => {
		setShowJsonModal(true);
	};

	const JsonModal = () =>
		showJsonModal && (
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
				<div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
					<div className="flex items-center justify-between p-6 border-b">
						<h3 className="text-xl font-bold text-gray-800">
							八宅風水分析 - DeepSeek AI 原始數據
						</h3>
						<button
							onClick={() => setShowJsonModal(false)}
							className="text-2xl text-gray-500 hover:text-gray-700"
						>
							×
						</button>
					</div>
					<div className="flex-1 p-6 overflow-auto">
						<pre className="p-4 overflow-auto text-sm whitespace-pre-wrap bg-gray-100 rounded">
							{JSON.stringify(analysisData, null, 2)}
						</pre>
					</div>
					<div className="flex gap-4 p-6 border-t">
						<button
							onClick={downloadJsonData}
							className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
						>
							💾 下載JSON文件
						</button>
						<button
							onClick={() => {
								navigator.clipboard.writeText(
									JSON.stringify(analysisData, null, 2)
								);
								alert("JSON數據已複製到剪貼板");
							}}
							className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
						>
							📋 複製到剪貼板
						</button>
						<button
							onClick={() => setShowJsonModal(false)}
							className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
						>
							關閉
						</button>
					</div>
				</div>
			</div>
		);

	if (loading) {
		return (
			<div
				className="flex items-center justify-center w-full min-h-screen"
				style={{ backgroundColor: "#EFEFEF" }}
			>
				<div className="text-center">
					<LoadingSpinner />
					<p className="mt-4 text-lg text-amber-800">
						正在進行八宅風水分析...
					</p>
					<p className="mt-2 text-sm text-amber-600">
						分析命卦、房間方位和風水格局
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className="flex items-center justify-center w-full min-h-screen"
				style={{ backgroundColor: "#EFEFEF" }}
			>
				<div className="max-w-md text-center">
					<div className="p-8 bg-white rounded-lg shadow-lg">
						<div className="mb-4">
							<div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
								<svg
									className="w-8 h-8 text-red-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<h2 className="mb-4 text-2xl font-bold text-red-600">
								分析失敗
							</h2>
						</div>
						<p className="mb-6 leading-relaxed text-gray-600">
							{error}
						</p>
						<div className="space-y-3">
							<button
								onClick={() => router.push("/design")}
								className="w-full px-6 py-3 text-white transition-colors rounded-lg bg-amber-600 hover:bg-amber-700"
							>
								前往設計頁面
							</button>
							<button
								onClick={() => window.location.reload()}
								className="w-full px-6 py-3 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
							>
								重新嘗試
							</button>
						</div>
						<p className="mt-4 text-xs text-gray-400">
							如果問題持續發生，請聯繫客服支援
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!analysisData) {
		return (
			<div
				className="flex items-center justify-center w-full min-h-screen"
				style={{ backgroundColor: "#EFEFEF" }}
			>
				<div className="max-w-md text-center">
					<div className="p-8 bg-white rounded-lg shadow-lg">
						<h2 className="mb-4 text-2xl font-bold text-amber-800">
							八宅風水分析
						</h2>
						<p className="mb-4 text-gray-600">
							請從設計頁面訪問此分析功能
						</p>
						<a
							href="/design"
							className="inline-block px-6 py-2 text-white rounded bg-amber-600 hover:bg-amber-700"
						>
							前往設計頁面
						</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="w-full min-h-screen"
			style={{ backgroundColor: "#EFEFEF" }}
		>
			<div id="report-content" className="w-full">
				{/* Header */}
				{/* <div className="mb-8 text-center">
					<h1 className="flex items-center justify-center mb-4 text-4xl font-bold text-amber-800">
						<span className="mr-4">🏠</span>
						八宅風水分析報告
						<span className="ml-4">🧭</span>
					</h1>
					<p className="text-lg text-amber-700">
						基於傳統八宅風水理論的專業命卦分析
					</p>
					<div className="inline-block p-4 mt-4 bg-white rounded-lg shadow-md">
						<div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
							<div>
								<span className="font-medium">分析時間：</span>
								<br />
								{new Date(
									analysisData.timestamp
								).toLocaleString("zh-TW")}
							</div>
							<div>
								<span className="font-medium">房間總數：</span>
								<br />
								{analysisData.designSummary.totalRooms} 間
							</div>
							<div>
								<span className="font-medium">分析年份：</span>
								<br />
								{analysisData.year}年（蛇年）
							</div>
						</div>
					</div>
				</div> */}

				{/* 命卦信息 */}
				{/* <div className="mb-12">
					<MingGuaInfo
						mingGuaInfo={analysisData.mingGuaInfo}
						userProfile={analysisData.userProfile}
						designSummary={analysisData.designSummary}
					/>
				</div> */}

				{/* 八宅羅盤 */}
				{/* <div className="w-full mb-6">
					<BazhaiCompass
						roomAnalyses={analysisData.roomAnalyses}
						mingGuaInfo={analysisData.mingGuaInfo}
						compassRotation={
							analysisData.designSummary.compassRotation
						}
					/>
				</div> */}
				<ShopNavbar />
				{/* 整體分析 */}
				<div className="flex items-center justify-center w-full">
					<OverallBazhaiAnalysis
						analysis={analysisData.overallAnalysis}
						mingGuaInfo={analysisData.mingGuaInfo}
						userProfile={analysisData.userProfile}
						designSummary={analysisData.designSummary}
						roomAnalyses={analysisData.roomAnalyses}
						yearlyAdvice={analysisData.yearlyAdvice}
						comprehensiveAdvice={analysisData.comprehensiveAdvice}
					/>
				</div>
				<Footer />
				{/* 各房間詳細分析 */}
				{/* <div className="mb-12">
					<h2 className="mb-6 text-3xl font-bold text-center text-amber-800">
						各房間八宅風水分析
					</h2>
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						{analysisData.roomAnalyses.map(
							(roomAnalysis, index) => (
								<RoomBazhaiCard
									key={roomAnalysis.roomId || index}
									roomAnalysis={roomAnalysis}
									mingGuaInfo={analysisData.mingGuaInfo}
								/>
							)
						)}
					</div>
				</div>
 */}
				{/* 操作按鈕 */}
				{/* <div className="mb-8 space-x-4 text-center no-print">
					<button
						onClick={downloadReportAsPDF}
						disabled={isGeneratingPDF}
						className={`px-8 py-3 rounded-lg transition-colors ${
							isGeneratingPDF
								? "bg-gray-400 cursor-not-allowed"
								: "bg-amber-600 hover:bg-amber-700"
						} text-white`}
						title="下載PDF格式的報告文件"
					>
						{isGeneratingPDF ? (
							<>
								<span className="inline-block mr-2 animate-spin">
									⏳
								</span>
								生成PDF中...
							</>
						) : (
							"📄 下載PDF報告"
						)}
					</button>
					<button
						onClick={handlePrintToPDF}
						className="px-8 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
						title="使用瀏覽器列印功能生成PDF（替代方案）"
					>
						🖨️ 列印報告
					</button>
					<button
						onClick={showJsonData}
						className="px-8 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
						title="查看DeepSeek AI的原始分析數據"
					>
						📊 查看AI數據
					</button>
					<button
						onClick={() => window.history.back()}
						className="px-8 py-3 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
					>
						↩️ 返回設計
					</button>
				</div> */}

				{/* Footer 說明 */}
				{/* <div className="mt-12 text-sm text-center text-gray-600">
					<p className="mb-2">
						本報告基於傳統八宅風水理論生成，結合2025年九宮飛星進行分析
					</p>
					<p>建議結合實地勘察和專業風水師指導使用</p>
				</div> */}
			</div>

			{/* JSON Modal */}
			{/* <JsonModal /> */}
		</div>
	);
}
