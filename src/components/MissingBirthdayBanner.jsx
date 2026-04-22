"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function MissingBirthdayBanner({ className = "" }) {
	const { status } = useSession();
	const locale = useLocale();
	const pathname = usePathname();
	const [showBanner, setShowBanner] = useState(false);
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		if (status !== "authenticated") {
			setShowBanner(false);
			setChecked(true);
			return;
		}

		let mounted = true;
		const loadProfile = async () => {
			try {
				const response = await fetch("/api/profile", { cache: "no-store" });
				const data = await response.json();
				if (!mounted) return;
				setShowBanner(Boolean(data?.ok && data?.profile?.hasBirthday === false));
			} catch (_error) {
				if (mounted) {
					setShowBanner(false);
				}
			} finally {
				if (mounted) {
					setChecked(true);
				}
			}
		};

		loadProfile();
		return () => {
			mounted = false;
		};
	}, [status]);

	if (!checked || !showBanner || pathname?.includes("/profile")) {
		return null;
	}

	const text =
		locale === "zh-CN"
			? "若要接收每周风水建议，请先到个人资料填写生日。"
			: "若要接收每週風水建議，請先到個人資料填寫生日。";

	const linkText = locale === "zh-CN" ? "前往个人资料" : "前往個人資料";

	return (
		<div
			className={`w-full border-b border-[#e7d7a7] bg-[#fff7dd] text-[#5f4d1c] ${className}`}
		>
			<div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs md:text-sm">
				<span>{text} </span>
				<Link
					href="/profile"
					className="font-semibold underline underline-offset-2 hover:opacity-80"
				>
					{linkText}
				</Link>
			</div>
		</div>
	);
}
