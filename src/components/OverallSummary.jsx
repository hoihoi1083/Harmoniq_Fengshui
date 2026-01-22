'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';

/**
 * OverallSummary Component
 * 
 * Displays a shareable summary card for the user's 2026 feng shui report.
 * Features:
 * - 8-12 character key phrase
 * - 3 core themes
 * - Shareable quote
 * - Year overview
 * - Copy to clipboard functionality
 */

export default function OverallSummary({ concernColor = '#8B5CF6' }) {
	const [summaryData, setSummaryData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [copied, setCopied] = useState(false);

	const loadSummary = async () => {
		setLoading(true);
		setError(null);

		try {
			const dataStore = window.componentDataStore || {};

			console.log('🔍 OverallSummary checking data availability:', {
				hasQuestionFocus: !!dataStore.questionFocusAnalysis,
				hasCoreSuggestion: !!dataStore.coreSuggestionAnalysis,
				hasGanZhi: !!dataStore.ganZhiAnalysis,
				hasSpecific: !!dataStore.specificSuggestionAnalysis,
				allKeys: Object.keys(dataStore)
			});

			// Check if we have required data to generate summary
			// Note: Data is stored with "Analysis" suffix
			if (!dataStore.questionFocusAnalysis || !dataStore.coreSuggestionAnalysis) {
				console.log('⏳ Missing required data - questionFocus:', !!dataStore.questionFocusAnalysis, 'coreSuggestion:', !!dataStore.coreSuggestionAnalysis);
				setLoading(false);
				return;
			}

			// Collect all available analysis data
			const requestData = {
				locale: dataStore.locale || 'zh-TW',
				concernType: dataStore.concernType,
				questionFocusData: dataStore.questionFocusAnalysis,
				coreSuggestionData: dataStore.coreSuggestionAnalysis,
				ganzhiData: dataStore.ganZhiAnalysis,
				specificSuggestionData: dataStore.specificSuggestionAnalysis,
			};

			console.log('🎯 Loading overall summary with data:', {
				hasQuestionFocus: !!requestData.questionFocusData,
				hasCoreSuggestion: !!requestData.coreSuggestionData,
				hasGanzhi: !!requestData.ganzhiData,
				hasSpecific: !!requestData.specificSuggestionData,
			});

			const response = await fetch('/api/overall-summary', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to generate summary');
			}

			const result = await response.json();
			setSummaryData(result.data);

			// Store in dataStore for future reference
			if (window.componentDataStore) {
				window.componentDataStore.overallSummaryData = result.data;
			}
		} catch (err) {
			console.error('Error loading summary:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Load summary data when component mounts
	useEffect(() => {
		if (typeof window !== 'undefined' && window.componentDataStore) {
			let pollInterval;
			let timeoutId;
			let hasLoaded = false;
			
			const checkData = () => {
				if (hasLoaded) return;
				
				const dataStore = window.componentDataStore || {};
				
				console.log('🔄 OverallSummary checking data...', {
					hasQuestionFocus: !!dataStore.questionFocusAnalysis,
					hasCoreSuggestion: !!dataStore.coreSuggestionAnalysis,
				});
				
				// If we have enough data, load immediately
				if (dataStore.questionFocusAnalysis && dataStore.coreSuggestionAnalysis) {
					console.log('✅ OverallSummary: Required data found, loading summary');
					hasLoaded = true;
					clearInterval(pollInterval);
					clearTimeout(timeoutId);
					loadSummary();
				}
			};
			
			// Start checking after 10 seconds (let other components load first)
			timeoutId = setTimeout(() => {
				// Then poll every 3 seconds
				pollInterval = setInterval(checkData, 3000);
				// Do first check immediately
				checkData();
			}, 10000);
			
			return () => {
				clearInterval(pollInterval);
				clearTimeout(timeoutId);
			};
		}
	}, []);

	const handleCopyToClipboard = async () => {
		if (!summaryData) return;

		const shareText = `🌟 我的2026年運勢總結 🌟

【${summaryData.keyPhrase}】

✨ 核心洞察：
${summaryData.coreThemes.map((theme, i) => `${i + 1}. ${theme}`).join('\n')}

💬 ${summaryData.shareableQuote}

📊 全年展望：
${summaryData.yearOverview}

---
來自 HarmoniqFengShui 命理分析報告`;

		try {
			await navigator.clipboard.writeText(shareText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	if (loading) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-4xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-lg"
			>
				<div className="flex items-center justify-center space-x-2">
					<div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
					<div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
					<div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
				</div>
				<p className="text-center mt-4 text-gray-600">正在為您生成人生總結...</p>
			</motion.div>
		);
	}

	if (error) {
		// Don't show error if it's just missing data (will retry)
		if (error.includes('Missing required analysis data')) {
			return null;
		}
		
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-4xl mx-auto my-8 p-8 bg-red-50 border border-red-200 rounded-2xl"
			>
				<p className="text-red-600 text-center">載入失敗：{error}</p>
				<button
					onClick={loadSummary}
					className="mt-4 mx-auto block px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
				>
					重試
				</button>
			</motion.div>
		);
	}

	if (!summaryData) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="w-full max-w-4xl mx-auto my-12 relative"
		>
			{/* Main Summary Card */}
			<div
				className="relative p-10 rounded-3xl shadow-2xl overflow-hidden"
				style={{
					background: `linear-gradient(135deg, ${concernColor}15 0%, ${concernColor}05 100%)`,
					border: `2px solid ${concernColor}30`,
				}}
			>
				{/* Decorative Elements */}
				<div
					className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
					style={{ background: concernColor }}
				/>
				<div
					className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15"
					style={{ background: concernColor }}
				/>

				{/* Content */}
				<div className="relative z-10">
					{/* Header */}
					<div className="text-center mb-8">
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="inline-block"
						>
							<h2 className="text-sm font-medium text-gray-500 mb-2">🌟 我的2026年 🌟</h2>
							<h1
								className="text-4xl md:text-5xl font-bold mb-4"
								style={{ color: concernColor }}
							>
								{summaryData.keyPhrase}
							</h1>
						</motion.div>
					</div>

					{/* Core Themes */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="mb-8 space-y-4"
					>
						<h3 className="text-lg font-semibold text-gray-700 mb-4">✨ 核心洞察</h3>
						{summaryData.coreThemes.map((theme, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.4 + index * 0.1 }}
								className="flex items-start space-x-3"
							>
								<div
									className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
									style={{ background: concernColor }}
								>
									{index + 1}
								</div>
								<p className="flex-1 text-gray-700 leading-relaxed pt-1">{theme}</p>
							</motion.div>
						))}
					</motion.div>

					{/* Shareable Quote */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
						className="mb-8 p-6 rounded-2xl"
						style={{
							background: `${concernColor}10`,
							borderLeft: `4px solid ${concernColor}`,
						}}
					>
						<div className="flex items-start space-x-3">
							<span className="text-3xl" style={{ color: concernColor }}>💬</span>
							<p className="flex-1 text-lg italic text-gray-800 leading-relaxed pt-1">
								{summaryData.shareableQuote}
							</p>
						</div>
					</motion.div>

					{/* Year Overview */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
					>
						<h3 className="text-lg font-semibold text-gray-700 mb-3">📊 全年展望</h3>
						<p className="text-gray-700 leading-relaxed">
							{summaryData.yearOverview}
						</p>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}
