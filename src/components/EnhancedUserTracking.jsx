"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Enhanced user session tracking
export const trackUserSession = () => {
	if (typeof window !== "undefined" && window.gtag) {
		// Create anonymous user fingerprint
		const userFingerprint = {
			sessionId: Date.now() + Math.random().toString(36),
			screenResolution: `${screen.width}x${screen.height}`,
			browserLanguage: navigator.language,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
				? "mobile"
				: "desktop",
			referrer: document.referrer || "direct",
		};

		// Send custom user session event
		window.gtag("event", "user_session_start", {
			custom_parameter_1: userFingerprint.sessionId,
			custom_parameter_2: userFingerprint.deviceType,
			custom_parameter_3: userFingerprint.browserLanguage,
			custom_parameter_4: userFingerprint.timezone,
			event_category: "user_tracking",
			event_label: "session_tracking",
		});

		// Store in sessionStorage for this session
		sessionStorage.setItem(
			"feng_shui_session",
			JSON.stringify(userFingerprint)
		);
	}
};

// Track feng shui specific user actions
export const trackFengShuiAction = (action, details = {}) => {
	if (typeof window !== "undefined" && window.gtag) {
		const sessionData = JSON.parse(
			sessionStorage.getItem("feng_shui_session") || "{}"
		);

		window.gtag("event", action, {
			event_category: "feng_shui_interaction",
			event_label: details.label || action,
			custom_parameter_1: sessionData.sessionId || "unknown",
			custom_parameter_2: details.roomType || "",
			custom_parameter_3: details.analysisType || "",
			value: details.value || 0,
		});
	}
};

// Track user progression through feng shui analysis
export const trackUserJourney = (step, stepData = {}) => {
	if (typeof window !== "undefined" && window.gtag) {
		const sessionData = JSON.parse(
			sessionStorage.getItem("feng_shui_session") || "{}"
		);

		window.gtag("event", "feng_shui_journey", {
			event_category: "user_journey",
			event_label: step,
			custom_parameter_1: sessionData.sessionId || "unknown",
			custom_parameter_2: stepData.currentStep || step,
			custom_parameter_3: stepData.totalSteps || "unknown",
			custom_parameter_4: stepData.timeSpent || 0,
		});
	}
};

export default function EnhancedUserTracking() {
	const pathname = usePathname();

	useEffect(() => {
		if (!GA_TRACKING_ID) return;

		// Initialize user session tracking
		trackUserSession();

		// Track page navigation in user journey
		trackUserJourney("page_view", {
			currentStep: pathname,
			timeSpent: Date.now(),
		});
	}, [pathname]);

	return null;
}
