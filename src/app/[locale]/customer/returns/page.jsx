"use client";

import React from "react";
import { useTranslations } from "next-intl";

function highlightParts(text, phrases) {
	if (!text || !phrases?.length) return text;
	const parts = [];
	let remaining = text;
	let keyIdx = 0;
	while (remaining.length > 0) {
		let found = null;
		let earliest = remaining.length;
		for (const p of phrases) {
			const idx = remaining.indexOf(p);
			if (idx >= 0 && idx < earliest) {
				earliest = idx;
				found = p;
			}
		}
		if (found === null) {
			parts.push(remaining);
			break;
		}
		if (earliest > 0) parts.push(remaining.slice(0, earliest));
		parts.push(
			<span key={`hl-${keyIdx++}`} className="text-[#5a6b2a]">
				{found}
			</span>,
		);
		remaining = remaining.slice(earliest + found.length);
	}
	return parts.length === 1 && typeof parts[0] === "string"
		? parts[0]
		: parts;
}

export default function ReturnsPage() {
	const t = useTranslations("home.returns");

	// Build content from i18n; section1 item1 uses highlight "all" (no phrase)
	const section1Items = [
		{
			label: t("section1.item0.label"),
			text: t("section1.item0.text"),
			highlight: [t("section1.item0.highlightPhrase")],
		},
		{
			label: t("section1.item1.label"),
			text: t("section1.item1.text"),
			highlight: "all",
		},
		{
			label: t("section1.item2.label"),
			text: t("section1.item2.text"),
			highlight: [t("section1.item2.highlightPhrase")],
		},
	];

	const section2Items = [0, 1, 2, 3, 4, 5].map((i) => ({
		label: t(`section2.item${i}.label`),
		text: t(`section2.item${i}.text`),
	}));

	const content = {
		title: t("title"),
		intro: t("intro"),
		sections: [
			{ title: t("section0.title"), body: t("section0.body") },
			{
				title: t("section1.title"),
				numbered: true,
				items: section1Items,
			},
			{
				title: t("section2.title"),
				bulleted: true,
				intro: t("section2.intro"),
				items: section2Items,
			},
			{ title: t("section4.title"), body: t("section4.body") },
			{ title: t("section5.title"), body: t("section5.body") },
			{ title: t("section3.title"), body: t("section3.body") },
		],
	};

	return (
		<div className="py-20 bg-[#EFEFEF] min-h-screen">
			<div className="max-w-4xl px-6 mx-auto">
				{/* Header */}
				<div className="mt-10 mb-10 text-center">
					<h1 className="mb-2 text-4xl font-bold font-lora text-brown">
						{content.title}
					</h1>
					<p className="max-w-2xl mx-auto mt-4 mb-2 font-lora text-brown-light">
						{content.intro}
					</p>
				</div>
				{/* Sections */}
				<div className="space-y-6">
					{content.sections.map((section, index) => (
						<section
							key={index}
							className="bg-white rounded-xl p-6 sm:p-8 shadow-sm"
						>
							{section.numbered ? (
								<>
									<h2 className="font-lora text-xl font-semibold text-brown mb-4 pl-4 ">
										{section.title}
									</h2>
									<div className="space-y-4 font-lora text-brown-light">
										{section.items.map((item, i) => (
											<div key={i} className="pl-0">
												<p className="mb-1">
													<span className="font-semibold text-brown">
														{i + 1}. {item.label}
													</span>
													{item.highlight ===
													"all" ? (
														<span className="text-[#5a6b2a]">
															{" "}
															{item.text}
														</span>
													) : (
														<>
															{" "}
															{highlightParts(
																item.text,
																item.highlight ||
																	[],
															)}
														</>
													)}
												</p>
												{item.sub && (
													<p className="mt-2 ml-4 text-[#5a6b2a]">
														<span className="mr-1.5">
															○
														</span>
														{item.sub}
													</p>
												)}
											</div>
										))}
									</div>
								</>
							) : section.bulleted ? (
								<>
									<h2 className="font-lora text-xl font-semibold text-brown mb-4 pl-4 ">
										{section.title}
									</h2>
									<div className="space-y-3 font-lora text-brown-light">
										{section.intro && (
											<p className="mb-4 whitespace-pre-wrap">
												{section.intro}
											</p>
										)}
										<ul className="list-none space-y-3 pl-0">
											{section.items.map((item, i) => (
												<li
													key={i}
													className="flex gap-2"
												>
													<span className="text-brown flex-shrink-0">
														•
													</span>
													<span>
														<span className="font-medium text-brown">
															{item.label}
														</span>{" "}
														{item.text}
													</span>
												</li>
											))}
										</ul>
									</div>
								</>
							) : (
								<>
									<h2 className="font-lora text-xl font-semibold text-brown mb-4">
										{section.title}
									</h2>
									<div className="space-y-4">
										<p className="font-lora text-brown-light whitespace-pre-wrap">
											{section.body}
										</p>
									</div>
								</>
							)}
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
