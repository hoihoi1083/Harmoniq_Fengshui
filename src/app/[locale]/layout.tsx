import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import AuthProvider from "@/components/AuthProvider";
import PageTracker from "@/components/PageTracker";
import AutoButtonTracker from "@/components/AutoButtonTracker";
import UserBehaviorTracker from "@/components/UserBehaviorTracker";
import FengShuiActivityTracker from "@/components/FengShuiActivityTracker";
import MixpanelAuthTracker from "@/components/MixpanelAuthTracker";
import MixpanelPageTracker from "@/components/MixpanelPageTracker";
import MixpanelButtonTracker from "@/components/MixpanelButtonTracker";
import ChatboxTracker from "@/components/ChatboxTracker";
import { setRequestLocale } from "next-intl/server";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ImageProvider } from "@/context/ImageContext";
import { UserProvider } from "@/context/UserContext";
import { event } from "@/components/GoogleAnalytics";
import type { Metadata } from "next";

// Generate dynamic metadata based on locale
export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const isSimplified = locale === "zh-CN";

	const metadata = {
		"zh-TW": {
			title: "小鈴命理聊天室 - 開啟運勢之門",
			description:
				"小鈴命理聊天室歡迎您線上即時分享命運小謎團，不論尋找甜蜜桃花或喚醒財富寶藏，小鈴都會免費提供測算。一對一指導，超簡單上手，從家中佈局到改善小習慣，一起迎接正能量，開啟屬於您的快樂故事！",
			keywords:
				"風水, 命理, 運勢, 八字, 紫微斗數, 桃花運, 財運, 事業運, feng shui, fortune telling",
			siteName: "小鈴命理聊天室",
			author: "小鈴命理聊天室",
		},
		"zh-CN": {
			title: "小铃命理聊天室 - 开启运势之门",
			description:
				"小铃命理聊天室欢迎您线上即时分享命运小谜团，不论寻找甜蜜桃花或唤醒财富宝藏，小铃都会免费提供测算。一对一指导，超简单上手，从家中布局到改善小习惯，一起迎接正能量，开启属于您的快乐故事！",
			keywords:
				"风水, 命理, 运势, 八字, 紫微斗数, 桃花运, 财运, 事业运, feng shui, fortune telling",
			siteName: "小铃命理聊天室",
			author: "小铃命理聊天室",
		},
	};

	const currentMetadata = metadata[isSimplified ? "zh-CN" : "zh-TW"];

	return {
		title: currentMetadata.title,
		description: currentMetadata.description,
		keywords: currentMetadata.keywords,
		authors: [{ name: currentMetadata.author }],
		creator: currentMetadata.author,
		publisher: currentMetadata.author,

		openGraph: {
			type: "website",
			locale: isSimplified ? "zh_CN" : "zh_TW",
			url: "https://www.harmoniqfengshui.com",
			siteName: currentMetadata.siteName,
			title: currentMetadata.title,
			description: currentMetadata.description,
			images: [
				{
					url: "/images/hero/hero-bg.png",
					width: 1200,
					height: 630,
					alt: currentMetadata.title,
				},
			],
		},

		twitter: {
			card: "summary_large_image",
			title: currentMetadata.title,
			description: currentMetadata.description,
			images: ["/images/hero/hero-bg.png"],
			creator: `@${currentMetadata.author}`,
			site: `@${currentMetadata.author}`,
		},
	};
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	setRequestLocale(locale);

	return (
		<>
			<PageTracker />
			<AutoButtonTracker />
			<UserBehaviorTracker />
			<FengShuiActivityTracker />
			<MixpanelPageTracker />
			<MixpanelButtonTracker />
			<ChatboxTracker />
			<ToastContainer
				position="top-center"
				autoClose={1000}
				hideProgressBar={true}
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				pauseOnHover
				theme="light"
				className={"text:sm"}
			/>
			<AuthProvider>
				<MixpanelAuthTracker />
				<UserProvider>
					<ImageProvider>
						<NextIntlClientProvider locale={locale}>
							{children}
						</NextIntlClientProvider>
					</ImageProvider>
				</UserProvider>
			</AuthProvider>
		</>
	);
}

export const useAnalytics = () => {
	const trackEvent = (
		action: string,
		category: string,
		label?: string,
		value?: number
	) => {
		event({ action, category, label, value });
	};

	// Predefined tracking functions for common events
	const trackButtonClick = (buttonName: string) => {
		trackEvent("click", "Button", buttonName);
	};

	const trackFormSubmission = (formName: string) => {
		trackEvent("submit", "Form", formName);
	};

	const trackPageView = (pageName: string) => {
		trackEvent("page_view", "Navigation", pageName);
	};

	const trackFengShuiAnalysis = (analysisType: string) => {
		trackEvent("analysis_complete", "FengShui", analysisType);
	};

	return {
		trackEvent,
		trackButtonClick,
		trackFormSubmission,
		trackPageView,
		trackFengShuiAnalysis,
	};
};
