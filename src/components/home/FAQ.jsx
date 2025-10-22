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

export default function FAQ() {
	const t = useTranslations("home.FAQ");
	const [showMore, setShowMore] = useState(false);

	return (
		<section className="relative py-8 md:py-20 -mt-10 md:-mt-20 -mb-10 md:-mb-20 bg-[#EFEFEF] rounded-2xl md:rounded-[60px] z-50 w-screen md:max-full mx-auto">
			<div className="container px-4 mx-auto">
				<h3 className="mb-6 md:mb-9 font-extrabold text-center text-[32px] md:text-[56px] text-[#073E31] font-serif">
					{t("title")}
				</h3>
				<div className="flex flex-col items-center max-w-full mx-auto md:max-w-6xl">
					<Accordion
						type="single"
						collapsible
						className="w-full"
						defaultValue="item-1"
					>
						<AccordionItem
							value="item-1"
							className="data-[state=open]:bg-[#EFEFEFE] py-4 md:py-7 px-4 md:px-6 data-[state=open]:mb-4 md:data-[state=open]:mb-8 data-[state=closed]:pt-0"
						>
							<AccordionTrigger className="font-normal font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
								<span className="font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
									{t("q1")}
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-3 md:pt-4 pb-0 font-sans font-light text-[14px] md:text-[18px] text-[#2E3933]">
								{t("a1")}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-2"
							className="data-[state=open]:bg-[#EFEFEFE] py-4 md:py-7 px-4 md:px-6 data-[state=open]:mb-4 md:data-[state=open]:mb-8 data-[state=closed]:pt-0"
						>
							<AccordionTrigger className="font-normal font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
								<span className="font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
									{t("q2")}
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-3 md:pt-4 pb-0 font-sans font-light text-[14px] md:text-[18px] text-[#2E3933]">
								{t("a2")}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-3"
							className="data-[state=open]:bg-[#EFEFEFE] py-4 md:py-7 px-4 md:px-6 data-[state=open]:mb-4 md:data-[state=open]:mb-8 data-[state=closed]:pt-0"
						>
							<AccordionTrigger className="font-normal font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
								<span className="font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
									{t("q3")}
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-3 md:pt-4 pb-0 font-sans font-light text-[14px] md:text-[18px] text-[#2E3933]">
								{t("a3")}
							</AccordionContent>
						</AccordionItem>
						{showMore && (
							<>
								{[4, 5, 6, 7, 8].map((num) => (
									<AccordionItem
										key={`item-${num}`}
										value={`item-${num}`}
										className="data-[state=open]:bg-[#EFEFEFE] py-4 md:py-7 px-4 md:px-6 data-[state=open]:mb-4 md:data-[state=open]:mb-8 data-[state=closed]:pt-0"
									>
										<AccordionTrigger className="font-normal font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
											<span className="font-sans font-[400] text-[16px] md:text-[20px] text-[#073E31]">
												{t(`q${num}`)}
											</span>
										</AccordionTrigger>
										<AccordionContent className="pt-3 md:pt-4 pb-0 font-sans font-light text-[14px] md:text-[18px] text-[#2E3933]">
											{t(`a${num}`)}
										</AccordionContent>
									</AccordionItem>
								))}
							</>
						)}
					</Accordion>
					<button
						onClick={() => setShowMore(!showMore)}
						className="flex items-center justify-center mt-4 text-center cursor-pointer w-[140px] md:w-[168px] h-10 md:h-[50px] rounded-full bg-[#A3B116] text-white font-sans font-[400] text-[14px] md:text-[16px] border-none"
					>
						{showMore ? (
							<span className="flex items-center gap-1">
								<ChevronUp size={20} />
								{t("closeMore")}
							</span>
						) : (
							<span className="flex items-center gap-1">
								<ChevronDown size={20} />
								{t("showMore")}
							</span>
						)}
					</button>
				</div>
			</div>
		</section>
	);
}
