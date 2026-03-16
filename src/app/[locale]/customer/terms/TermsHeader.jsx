import React from "react";
import { useTranslations } from "next-intl";

const TermsHeader = () => {
	const t = useTranslations("home.terms");

	return (
		<div className="mt-10 mb-10 text-center">
			<h1 className="mb-2 text-4xl font-bold font-lora text-brown">
				{t("title")}
			</h1>
			<p className="max-w-2xl mx-auto mt-4 mb-2 font-lora text-brown-light">
				{t("description")}
			</p>
			<p>更新日期：2025年【3】月【16】日</p>
			<p>生效日期：2025年【3】月【16】日</p>
		</div>
	);
};

export default TermsHeader;
