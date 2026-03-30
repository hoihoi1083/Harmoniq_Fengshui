"use client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

function FaqItems({ indices, itemClassName, triggerClassName, triggerSpanClassName, contentClassName, t }) {
	return (
		<>
			{indices.map((n) => (
				<AccordionItem
					key={n}
					value={`item-${n}`}
					className={itemClassName}
				>
					<AccordionTrigger className={triggerClassName}>
						<span className={triggerSpanClassName}>{t(`q${n}`)}</span>
					</AccordionTrigger>
					<AccordionContent className={contentClassName}>
						{t(`a${n}`)}
					</AccordionContent>
				</AccordionItem>
			))}
		</>
	);
}

export default function FAQ() {
	const t = useTranslations("home.FAQ");
	const [showMore, setShowMore] = useState(false);

	const itemClassName =
		"data-[state=open]:bg-[#EFEFEF] py-3 sm:py-4 md:py-7 px-3 sm:px-4 md:px-6 data-[state=open]:mb-3 sm:data-[state=open]:mb-4 md:data-[state=open]:mb-8 data-[state=closed]:pt-0";
	const triggerClassName =
		"font-normal font-sans font-[400] text-sm sm:text-[16px] md:text-[20px] text-[#073E31] [&[data-state=open]>span]:font-medium";
	const triggerSpanClassName =
		"font-sans font-[400] text-sm sm:text-[16px] md:text-[20px] text-[#073E31] text-left";
	const contentClassName =
		"pt-2 sm:pt-3 md:pt-4 pb-0 font-sans font-light text-xs sm:text-[14px] md:text-[18px] text-[#2E3933] leading-relaxed";

	const faqProps = {
		itemClassName,
		triggerClassName,
		triggerSpanClassName,
		contentClassName,
		t,
	};

	return (
		<section className="relative py-6 sm:py-8 md:py-20 mt-6 md:mt-10 mb-10 md:mb-5 bg-[#CCCDCF] rounded-2xl md:rounded-[60px] z-50">
			<div className="container px-4 sm:px-6 md:px-8 mx-auto max-w-full">
				<h3 className="mb-5 sm:mb-6 md:mb-9 font-extrabold text-center text-2xl sm:text-[32px] md:text-[56px] text-[#073E31] font-serif px-1">
					{t("title")}
				</h3>
				<div className="flex flex-col items-center max-w-full mx-auto md:max-w-6xl w-full">
					<Accordion
						type="single"
						collapsible
						className="w-full"
						defaultValue="item-1"
					>
						<FaqItems indices={[1, 2, 3, 4]} {...faqProps} />
						{showMore && <FaqItems indices={[5, 6, 7, 8]} {...faqProps} />}
					</Accordion>
					<button
						type="button"
						onClick={() => setShowMore(!showMore)}
						className="flex items-center justify-center mt-4 sm:mt-5 min-h-11 sm:min-h-0 w-full sm:w-[140px] md:w-[168px] h-11 sm:h-10 md:h-[50px] rounded-full bg-[#A3B116] text-white font-sans font-[400] text-sm sm:text-[14px] md:text-[16px] border-none cursor-pointer touch-manipulation"
					>
						{showMore ? (
							<span className="flex items-center gap-1.5">
								<ChevronUp className="w-5 h-5 shrink-0 sm:w-5 sm:h-5" />
								{t("closeMore")}
							</span>
						) : (
							<span className="flex items-center gap-1.5">
								<ChevronDown className="w-5 h-5 shrink-0 sm:w-5 sm:h-5" />
								{t("showMore")}
							</span>
						)}
					</button>
				</div>
			</div>
		</section>
	);
}
