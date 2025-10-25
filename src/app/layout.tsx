import { Inter, Lora } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MixpanelTracker from "@/components/MixpanelTracker";
import MixpanelAuthTracker from "@/components/MixpanelAuthTracker";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const lora = Lora({ subsets: ["latin", "symbols"] });

export const metadata = {
	title: "風鈴命理聊天室 | 风铃命理聊天室 - 開啟運勢之門 | 开启运势之门",
	description:
		"風鈴命理聊天室歡迎您線上即時分享命運小謎團，不論尋找甜蜜桃花或喚醒財富寶藏，風鈴都會免費提供測算。风铃命理聊天室欢迎您线上即时分享命运小谜团，不论寻找甜蜜桃花或唤醒财富宝藏，风铃都会免费提供测算。",
	keywords:
		"風水, 命理, 運勢, 八字, 紫微斗數, 桃花運, 財運, 事業運, 风水, 命理, 运势, 八字, 紫微斗数, 桃花运, 财运, 事业运, feng shui, fortune telling",
	authors: [{ name: "風鈴命理聊天室 | 风铃命理聊天室" }],
	creator: "風鈴命理聊天室 | 风铃命理聊天室",
	publisher: "風鈴命理聊天室 | 风铃命理聊天室",

	// Open Graph meta tags for social media sharing
	openGraph: {
		type: "website",
		locale: "zh_TW",
		alternateLocale: ["zh_CN"],
		url: "https://www.harmoniqfengshui.com",
		siteName: "風鈴命理聊天室 | 风铃命理聊天室",
		title: "風鈴命理聊天室 | 风铃命理聊天室 - 開啟運勢之門 | 开启运势之门",
		description:
			"風鈴命理聊天室歡迎您線上即時分享命運小謎團。风铃命理聊天室欢迎您线上即时分享命运小谜团。",
		images: [
			{
				url: "/images/hero/hero-bg.png", // Using hero background for better social media preview
				width: 1200,
				height: 630,
				alt: "風鈴命理聊天室 - 開啟運勢之門",
			},
		],
	},

	// Twitter Card meta tags
	twitter: {
		card: "summary_large_image",
		title: "風鈴命理聊天室 | 风铃命理聊天室 - 開啟運勢之門 | 开启运势之门",
		description:
			"風鈴命理聊天室歡迎您線上即時分享命運小謎團。风铃命理聊天室欢迎您线上即时分享命运小谜团。",
		images: ["/images/hero/hero-bg.png"], // Using hero background for consistent branding
		creator: "@風鈴命理聊天室",
		site: "@風鈴命理聊天室",
	},

	// Favicon and app icons
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{
				url: "/images/風水妹/風水妹.png",
				sizes: "32x32",
				type: "image/png",
			},
			{
				url: "/images/風水妹/風水妹.png",
				sizes: "16x16",
				type: "image/png",
			},
		],
		shortcut: "/favicon.ico",
		apple: "/images/風水妹/風水妹.png",
	},

	// Additional meta tags
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},

	// Verification tags (if you have them)
	verification: {
		// google: "your-google-verification-code",
		// yandex: "your-yandex-verification-code",
		// yahoo: "your-yahoo-verification-code",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="zh-TW">
			<head>
				<Suspense fallback={null}>
					<GoogleAnalytics />
				</Suspense>
			</head>
			<body className={lora.className}>
				<Suspense fallback={null}>
					<MixpanelTracker />
				</Suspense>
				{children}
			</body>
		</html>
	);
}
