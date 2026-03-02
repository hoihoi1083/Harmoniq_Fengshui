"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LifePrintReportPage() {
	const router = useRouter();
	const locale = useLocale();

	useEffect(() => {
		router.replace(`/${locale}/admin/life-print-report/input`);
	}, [locale, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
		</div>
	);
}
