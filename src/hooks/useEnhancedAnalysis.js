// Enhanced CoupleAnnualAnalysis with retry mechanism and better error handling
// This addresses the "Try Again" issue by adding:
// 1. Retry functionality for failed API calls
// 2. Timeout handling for long-running requests
// 3. Better error recovery
// 4. Manual retry button

import { useState, useEffect } from "react";

const useApiWithRetry = (url, options, maxRetries = 3, timeout = 30000) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	const fetchWithTimeout = async (url, options, timeout) => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
	};

	const executeRequest = async (retryAttempt = 0) => {
		setLoading(true);
		setError(null);

		try {
			console.log(
				`🚀 API Request attempt ${retryAttempt + 1}/${maxRetries + 1}: ${url}`
			);

			const response = await fetchWithTimeout(url, options, timeout);

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${response.statusText}`
				);
			}

			const result = await response.json();
			setData(result);
			setRetryCount(0);
			console.log(`✅ API Request successful: ${url}`);
		} catch (err) {
			console.error(
				`❌ API Request failed (attempt ${retryAttempt + 1}):`,
				err
			);

			if (retryAttempt < maxRetries) {
				setRetryCount(retryAttempt + 1);
				// Exponential backoff: wait 1s, 2s, 4s...
				const delay = Math.pow(2, retryAttempt) * 1000;
				console.log(`⏳ Retrying in ${delay}ms...`);

				setTimeout(() => {
					executeRequest(retryAttempt + 1);
				}, delay);
			} else {
				setError(err);
				setLoading(false);
			}
		}

		if (retryAttempt === 0) {
			setLoading(false);
		}
	};

	const retry = () => {
		executeRequest(0);
	};

	return { data, loading, error, retry, retryCount };
};

// Enhanced Annual Analysis Hook
const useEnhancedAnnualAnalysis = (user1, user2, analysisData) => {
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// API call for couple annual analysis
	const {
		data: annualData,
		loading: annualLoading,
		error: annualError,
		retry: retryAnnual,
	} = useApiWithRetry("/api/couple-annual-analysis", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			user1: {
				birthday: user1.birthDateTime,
				gender: user1.gender,
			},
			user2: {
				birthday: user2.birthDateTime,
				gender: user2.gender,
			},
			analysisData,
		}),
	});

	// API call for individual analysis
	const {
		data: individualData1,
		loading: individualLoading1,
		error: individualError1,
		retry: retryIndividual1,
	} = useApiWithRetry("/api/individual-analysis", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			birthDateTime: user1.birthDateTime,
			gender: user1.gender,
		}),
	});

	const {
		data: individualData2,
		loading: individualLoading2,
		error: individualError2,
		retry: retryIndividual2,
	} = useApiWithRetry("/api/individual-analysis", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			birthDateTime: user2.birthDateTime,
			gender: user2.gender,
		}),
	});

	const overallLoading =
		annualLoading || individualLoading1 || individualLoading2;
	const overallError = annualError || individualError1 || individualError2;

	const retryAll = () => {
		retryAnnual();
		retryIndividual1();
		retryIndividual2();
	};

	useEffect(() => {
		if (annualData && individualData1 && individualData2) {
			setResult({
				annual: annualData,
				individual1: individualData1,
				individual2: individualData2,
			});
		}
	}, [annualData, individualData1, individualData2]);

	return {
		result,
		loading: overallLoading,
		error: overallError,
		retry: retryAll,
	};
};

// Enhanced Error Component with Retry Button
const ErrorWithRetry = ({ error, onRetry, loading }) => (
	<div className="p-6 bg-white rounded-lg shadow-sm">
		<div className="text-center">
			<div className="mb-4">
				<div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
					<svg
						className="w-8 h-8 text-red-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 className="mb-2 text-lg font-semibold text-gray-900">
					分析載入失敗
				</h3>
				<p className="mb-4 text-sm text-gray-600">
					{error?.message?.includes("timeout")
						? "請求超時，這通常是由於網路連線問題或伺服器繁忙造成的。"
						: "載入年度分析時發生錯誤，請稍後重試。"}
				</p>
				<p className="mb-6 text-xs text-gray-500">
					錯誤詳情: {error?.message || "未知錯誤"}
				</p>
			</div>

			<button
				onClick={onRetry}
				disabled={loading}
				className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? (
					<>
						<svg
							className="w-4 h-4 mr-2 animate-spin"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						重新分析中...
					</>
				) : (
					<>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						重新嘗試
					</>
				)}
			</button>

			<div className="mt-4 text-xs text-gray-500">
				<p>💡 提示：如果問題持續發生，請嘗試以下步驟：</p>
				<ul className="mt-2 text-left list-disc list-inside">
					<li>檢查網路連線是否正常</li>
					<li>重新整理瀏覽器頁面</li>
					<li>清除瀏覽器快取</li>
					<li>稍後再試</li>
				</ul>
			</div>
		</div>
	</div>
);

export { useApiWithRetry, useEnhancedAnnualAnalysis, ErrorWithRetry };
