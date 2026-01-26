'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';
import { useCoupleAnalysis } from '@/contexts/CoupleAnalysisContext';

/**
 * CoupleOverallSummary Component
 * 
 * Displays a shareable summary card for couple's 2026 relationship feng shui report.
 * Features:
 * - 8-12 character relationship key phrase
 * - 3 core relationship themes
 * - Relationship motto/quote
 * - Year overview for the couple
 * - Copy to clipboard functionality
 */

export default function CoupleOverallSummary({ concernColor = '#EC4899' }) {
	const [summaryData, setSummaryData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [copied, setCopied] = useState(false);

	// Get couple analysis data from context
	const {
		coupleCoreSuggestionCache,
		annualAnalysisCache,
		coupleSeasonCache,
		coupleMingJuCache,
	} = useCoupleAnalysis();

	const loadSummary = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			console.log('🔍 CoupleOverallSummary checking context data:', {
				hasCoupleCoreSuggestion: !!coupleCoreSuggestionCache,
				hasCoupleAnnual: !!annualAnalysisCache,
				hasCoupleSpecific: !!coupleSeasonCache,
				hasMingJu: !!coupleMingJuCache,
			});

			// Check if we have required data to generate summary
			if (!coupleCoreSuggestionCache) {
				console.log('⏳ Missing required data - coupleCoreSuggestion');
				setLoading(false);
				return;
			}

			// Collect all available couple analysis data
			const requestData = {
				locale: 'zh-TW',
				concernType: '感情',
				coupleCoreSuggestionData: coupleCoreSuggestionCache,
				coupleAnnualData: annualAnalysisCache,
				coupleSeasonData: coupleSeasonCache,
				coupleSpecificData: coupleMingJuCache,
			};

			console.log('🎯 Loading couple overall summary with data:', {
				hasCoupleCoreSuggestion: !!requestData.coupleCoreSuggestionData,
				hasCoupleAnnual: !!requestData.coupleAnnualData,
				hasCoupleSpecific: !!requestData.coupleSpecificData,
			});

			const response = await fetch('/api/couple-overall-summary', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to generate couple summary');
			}

			const result = await response.json();
			setSummaryData(result.data);

			console.log('✅ Couple summary loaded successfully:', result.data);
		} catch (err) {
			console.error('Error loading couple summary:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [coupleCoreSuggestionCache, annualAnalysisCache, coupleSeasonCache, coupleMingJuCache]);

	// Load summary data when couple core suggestion data becomes available
	useEffect(() => {
		// Wait for couple core suggestion data to be available
		if (coupleCoreSuggestionCache && !summaryData && !loading && !error) {
			console.log('✅ CoupleCoreSuggestion data available, loading summary...');
			loadSummary();
		}
	}, [coupleCoreSuggestionCache, summaryData, loading, error, loadSummary]);

	const handleCopyText = async () => {
		if (!summaryData) return;

		const textToCopy = `
${summaryData.keyPhrase || ''}

${summaryData.themes?.map((theme, idx) => `${idx + 1}. ${theme}`).join('\n') || ''}

${summaryData.quote || ''}

${summaryData.yearOverview || ''}
		`.trim();

		try {
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	// Show loading state
	if (loading && !summaryData) {
		return (
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<div className="bg-white rounded-3xl shadow-xl p-8 text-center">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
					</div>
					<p className="mt-4 text-gray-500 text-sm">正在生成夫妻關係總結...</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<div className="bg-red-50 rounded-3xl shadow-xl p-8 text-center">
					<p className="text-red-600">載入失敗: {error}</p>
				</div>
			</div>
		);
	}

	// Don't render if no data
	if (!summaryData) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="w-full max-w-4xl mx-auto px-4 py-12"
		>
			<div 
				className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl shadow-2xl overflow-hidden"
				style={{
					borderTop: `6px solid ${concernColor}`,
				}}
			>
				{/* Header */}
				<div className="bg-white bg-opacity-70 backdrop-blur-sm p-8 text-center border-b border-gray-200">
					<motion.div
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: concernColor }}>
							夫妻關係 2026 總結
						</h2>
						<p className="text-gray-600 text-lg">你們的感情關鍵字</p>
					</motion.div>
				</div>

				{/* Main Content */}
				<div className="p-8 md:p-12 space-y-8">
					{/* Key Phrase */}
					{summaryData.keyPhrase && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="text-center"
						>
							<div 
								className="inline-block px-8 py-4 rounded-full text-2xl md:text-3xl font-bold text-white shadow-lg"
								style={{ backgroundColor: concernColor }}
							>
								{summaryData.keyPhrase}
							</div>
						</motion.div>
					)}

					{/* Three Themes */}
					{summaryData.themes && summaryData.themes.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="grid md:grid-cols-3 gap-6"
						>
							{summaryData.themes.map((theme, index) => (
								<div 
									key={index} 
									className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
								>
									<div 
										className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xl mx-auto"
										style={{ backgroundColor: concernColor }}
									>
										{index + 1}
									</div>
									<p className="text-center text-gray-800 text-lg font-medium leading-relaxed">
										{theme}
									</p>
								</div>
							))}
						</motion.div>
					)}

					{/* Quote */}
					{summaryData.quote && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="text-center py-8 px-6 bg-white rounded-2xl shadow-md"
						>
							<div className="text-4xl mb-4" style={{ color: concernColor }}>💕</div>
							<p className="text-xl md:text-2xl font-serif italic text-gray-700 leading-relaxed">
								「{summaryData.quote}」
							</p>
						</motion.div>
					)}

					{/* Year Overview */}
					{summaryData.yearOverview && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className="bg-white rounded-2xl p-8 shadow-md"
						>
							<h3 
								className="text-2xl font-bold mb-4 text-center"
								style={{ color: concernColor }}
							>
								2026年 感情展望
							</h3>
							<p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
								{summaryData.yearOverview}
							</p>
						</motion.div>
					)}
				</div>

				{/* Footer */}
				<div className="bg-gray-50 p-6 text-center border-t border-gray-200">
					<p className="text-gray-500 text-sm">
						💑 願你們的感情在 2026 年更加美滿幸福
					</p>
				</div>
			</div>
		</motion.div>
	);
}
