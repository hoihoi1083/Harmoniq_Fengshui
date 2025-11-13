"use client";
import CountdownTimer from "./CountdownTimer"; // 假设CountdownTimer在同一目录下
import FortuneDataModal from "@/components/FortuneDataModal";
import PaymentThankYou from "@/components/PaymentThankYou";
import { useState, useEffect, use } from "react";

export default function Success({ searchParams }) {
	const [sessionData, setSessionData] = useState(null);
	const [showFortuneModal, setShowFortuneModal] = useState(false);
	const [showThankYou, setShowThankYou] = useState(false);
	const [concernType, setConcernType] = useState("");
	const [debugInfo, setDebugInfo] = useState("");
	const [chatContext, setChatContext] = useState({
		fromChat: false,
		specificProblem: "",
		concern: "",
	});

	// Unwrap searchParams using React.use() for Next.js 15 compatibility
	const params = use(searchParams);

	useEffect(() => {
		const getSessionData = async () => {
			// Use unwrapped params
			const { session_id, type, concern, specificProblem, fromChat } =
				params;

			console.log("URL Parameters:", {
				session_id,
				type,
				concern,
				specificProblem,
				fromChat,
			}); // Debug log
			setDebugInfo(
				`URL params: session_id=${session_id}, type=${type}, concern=${concern}, specificProblem=${specificProblem}, fromChat=${fromChat}`
			);

			// Set chat context if coming from chat
			if (fromChat === "true") {
				setChatContext({
					fromChat: true,
					specificProblem: specificProblem || "",
					concern: concern || "",
				});
				console.log("💬 Chat context detected:", {
					specificProblem,
					concern,
				});
			}

			if (!session_id) {
				console.error("No session_id found in URL parameters");
				setSessionData({ error: "Please provide a valid session_id" });
				return;
			}

			try {
				console.log("Verifying payment for session:", session_id); // Debug log
				setDebugInfo((prev) => prev + `\nVerifying payment...`);

				// Use different API endpoint based on payment type
				const apiEndpoint =
					type === "fortune"
						? "/api/verify-fortune-payment"
						: type === "couple"
							? "/api/verify-couple-payment"
							: "/api/verify-payment";

				// Verify the payment session
				const response = await fetch(apiEndpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ sessionId: session_id }),
				});

				const data = await response.json();
				console.log("Payment verification response:", data); // Debug log
				setDebugInfo(
					(prev) => prev + `\nAPI response: ${JSON.stringify(data)}`
				);
				setSessionData(data);

				// Check if this is a fortune payment
				if (type === "fortune" && concern && data.status === 0) {
					console.log(
						"Showing thank you page for fortune concern:",
						concern
					); // Debug log
					setDebugInfo(
						(prev) =>
							prev +
							`\nShowing thank you page for fortune: ${concern}`
					);
					setConcernType(concern);
					setShowThankYou(true);
				}
				// Check if this is a couple payment
				else if (type === "couple" && data.status === 0) {
					console.log("Showing thank you page for couple"); // Debug log
					setDebugInfo(
						(prev) => prev + `\nShowing thank you page for couple`
					);
					setShowThankYou(true);
				}
				// If this is an expert188 or expert88 payment and status is complete, show thank you page
				else if (
					(type === "expert188" || type === "expert88") &&
					data.status === 0
				) {
					console.log(
						"Showing thank you page for expert payment:",
						type
					);
					setDebugInfo(
						(prev) =>
							prev +
							`\nShowing thank you page for expert: ${type}`
					);
					setShowThankYou(true);
				}
			} catch (error) {
				console.error("Error verifying payment:", error);
				setDebugInfo((prev) => prev + `\nError: ${error.message}`);
				setSessionData({ error: error.message });
			}
		};

		getSessionData();
	}, [params]);

	const handleCloseModal = () => {
		setShowFortuneModal(false);
		// Could redirect to home or show success message
	};

	const handleStartDataEntry = () => {
		const { type, session_id, concern, specificProblem, fromChat } = params;

		if (type === "fortune") {
			// Redirect to fortune-entry page for Fortune payments
			let fortuneUrl = `/fortune-entry?session_id=${session_id}`;
			if (concern) fortuneUrl += `&concern=${concern}`;
			if (fromChat === "true" && specificProblem) {
				fortuneUrl += `&specificProblem=${encodeURIComponent(specificProblem)}&fromChat=true`;
			}
			window.location.href = fortuneUrl;
		} else if (type === "couple") {
			// Redirect to couple-entry page for Couple payments
			let coupleUrl = `/couple-entry?session_id=${session_id}`;
			if (fromChat === "true" && specificProblem) {
				coupleUrl += `&specificProblem=${encodeURIComponent(specificProblem)}&fromChat=true`;
			}
			window.location.href = coupleUrl;
		} else if (type === "expert188" || type === "expert88") {
			// Redirect to birthday-entry for Expert payments
			window.location.href = `/birthday-entry?session_id=${session_id}`;
		}
	};

	// Show loading while verifying payment
	if (!sessionData) {
		return (
			<div className="flex items-center justify-center min-h-screen p-8">
				<div className="max-w-2xl text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B116] mx-auto mb-4"></div>
					<p className="mb-4 text-gray-600">驗證付款中...</p>
				</div>
			</div>
		);
	}

	if (sessionData.error) {
		return (
			<div className="flex items-center justify-center min-h-screen p-8">
				<div className="max-w-2xl text-center">
					<div className="mb-4 text-xl text-red-500">⚠️</div>
					<p className="mb-4 text-gray-600">
						錯誤: {sessionData.error}
					</p>
					<button
						onClick={() => (window.location.href = "/price")}
						className="px-4 py-2 bg-[#A3B116] text-white rounded-md hover:bg-[#8B9914]"
					>
						返回價格頁面
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Show Thank You page for fortune and couple payments */}
			{showThankYou && (
				<PaymentThankYou
					type={params.type}
					onStartDataEntry={handleStartDataEntry}
					sessionId={
						sessionData.sessionId || sessionData.data?.sessionId
					}
					concernType={concernType}
					chatContext={chatContext}
				/>
			)}

			{/* Only show CountdownTimer for non-fortune, non-couple, and non-expert payments */}
			{(!params.type ||
				(params.type !== "fortune" &&
					params.type !== "couple" &&
					params.type !== "expert188" &&
					params.type !== "expert88")) && (
				<CountdownTimer
					time={5}
					status={
						sessionData.status === 0 ? "complete" : "incomplete"
					}
				/>
			)}

			<FortuneDataModal
				isOpen={showFortuneModal}
				onClose={handleCloseModal}
				concernType={concernType}
				sessionId={sessionData.sessionId || sessionData.data?.sessionId}
				chatContext={chatContext}
			/>
		</>
	);
}
