"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegionDetectionWithRedirect } from "@/hooks/useRegionDetectionEnhanced";

export default function RegionLanguageSelector({
	className,
	navTextColor = "#fff",
	compact = false,
}) {
	const pathname = usePathname();
	const router = useRouter();
	const {
		region,
		changeRegion,
		isLoading,
		currentLocale: detectedLocale,
	} = useRegionDetectionWithRedirect({
		autoRedirect: true,
		skipFirstRedirect: true,
	});
	const [mounted, setMounted] = useState(false);
	const [switching, setSwitching] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Get current locale from pathname
	const currentLocale = pathname.startsWith("/zh-CN") ? "zh-CN" : "zh-TW";

	// Region configurations with language mapping
	const regions = [
		{
			key: "china",
			name: "中国大陆",
			locale: "zh-CN",
			currency: "CNY",
			symbol: "¥",
			displayText: "简体中文",
		},
		{
			key: "hongkong",
			name: "香港",
			locale: "zh-TW",
			currency: "HKD",
			symbol: "HK$",
			displayText: "繁體中文",
		},
		{
			key: "taiwan",
			name: "台灣",
			locale: "zh-TW",
			currency: "TWD",
			symbol: "NT$",
			displayText: "繁體中文",
		},
	]; // Get current region config
	const currentRegionConfig =
		regions.find((r) => r.key === region) || regions[2]; // Default to Taiwan

	// Get display text based on current state
	const getDisplayText = () => {
		if (!mounted) return compact ? "…" : "🌍 Loading...";
		if (isLoading || switching) return compact ? "…" : "🔄 Switching...";

		// Find region that matches current locale
		const matchingRegion = regions.find((r) => r.locale === currentLocale);

		if (compact) {
			// Return simplified Chinese character based on locale, with region indicator
			if (currentLocale === "zh-CN") {
				return "簡";
			} else {
				// For Traditional Chinese, show different indicators based on region
				if (region === "hongkong") return "港";
				if (region === "taiwan") return "台";
				return "繁"; // Default
			}
		}

		return matchingRegion
			? matchingRegion.displayText
			: currentRegionConfig.displayText;
	};

	// Handle region change - optimized for instant smooth transitions
	const handleRegionChange = async (selectedRegion) => {
		const regionConfig = regions.find((r) => r.key === selectedRegion);
		if (!regionConfig || switching) return;

		console.log(`🔄 Switching to region: ${selectedRegion}`);
		setSwitching(true);

		try {
			// Check if locale is different
			const needsLocaleChange = regionConfig.locale !== currentLocale;

			// Update region state immediately (for instant pricing updates)
			await changeRegion(selectedRegion);

			console.log(`✅ Region state updated to: ${selectedRegion}`);

			if (needsLocaleChange) {
				console.log(
					`🔄 Navigating from ${currentLocale} to ${regionConfig.locale}`
				);

				// Get the path without locale
				const pathParts = pathname.split("/").filter(Boolean);
				const pathWithoutLocale = pathParts.slice(1).join("/");
				const newPathname = pathWithoutLocale
					? `/${pathWithoutLocale}`
					: "/";

				// Start navigation immediately - don't wait
				router.replace(newPathname, { locale: regionConfig.locale });

				// Keep switching state visible for a brief moment for user feedback
				setTimeout(() => setSwitching(false), 150);
			} else {
				// Same locale but different region (HK vs TW) - need to refresh for pricing updates
				console.log(
					`✅ Same locale (${regionConfig.locale}), refreshing page for region change (${region} → ${selectedRegion})`
				);

				// Wait a bit for localStorage to be fully updated
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Force a hard refresh to ensure all components reload with new region
				window.location.reload();
			}
		} catch (error) {
			console.error("❌ Region change error:", error);
			setSwitching(false);
		}
	};

	if (!mounted) {
		return (
			<div
				className={cn(
					"cursor-pointer flex items-center space-x-1 opacity-50",
					className
				)}
			>
				<span style={{ color: navTextColor }}>
					{compact ? "…" : "🌍 Loading..."}
				</span>
			</div>
		);
	}

	return (
		<div className="relative inline-block">
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger
					asChild
					className={cn(
						"cursor-pointer flex items-center space-x-1 hover:opacity-80 outline-none transition-all duration-200 ease-in-out",
						switching && "opacity-60 scale-95",
						className
					)}
				>
					<div
						style={{ color: navTextColor }}
						className="transition-all duration-200 ease-in-out"
					>
						{getDisplayText()}
						{!compact && (
							<ChevronDownIcon
								className={cn(
									"inline w-4 h-4 ml-1 transition-transform duration-200",
									switching && "animate-spin"
								)}
							/>
						)}
					</div>
				</DropdownMenuTrigger>{" "}
				<DropdownMenuContent
					className="bg-white rounded-lg shadow-lg p-1 min-w-[160px] z-[9999] border border-gray-200 max-h-[300px] overflow-y-auto"
					sideOffset={8}
					align="end"
					avoidCollisions={true}
					sticky="always"
				>
					{regions.map((regionConfig) => (
						<DropdownMenuItem
							key={regionConfig.key}
							className="p-0 focus:bg-inherit"
							onClick={() => handleRegionChange(regionConfig.key)}
							disabled={switching}
						>
							<div
								className={cn(
									"w-full text-left px-4 py-2 text-sm hover:text-primary rounded text-foreground flex items-center justify-between cursor-pointer transition-all duration-150",
									region === regionConfig.key
										? "bg-green-50 text-green-600 font-medium"
										: "",
									switching && "opacity-50 cursor-wait"
								)}
							>
								<span>{regionConfig.displayText}</span>
								<span className="ml-2 text-xs text-gray-500">
									{regionConfig.symbol}
								</span>
								{switching && region === regionConfig.key && (
									<span className="ml-1 text-xs">⏳</span>
								)}
							</div>
						</DropdownMenuItem>
					))}

					{/* Debug info in development */}
					{process.env.NODE_ENV === "development" && (
						<>
							<div className="my-1 border-t border-gray-100"></div>
							<div className="px-4 py-2 text-xs text-gray-400">
								<div>Region: {region}</div>
								<div>Locale: {currentLocale}</div>
							</div>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
