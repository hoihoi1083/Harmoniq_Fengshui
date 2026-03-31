import ShopNavbar from "@/components/ShopNavbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Share from "@/components/home/Share";
import BeforeAfter from "@/components/home/BeforeAfter";
import Comments from "@/components/home/Comments";
import Tips from "@/components/home/Tips";
import FAQ from "@/components/home/FAQ";
import Message from "@/components/home/Message";
import Footer from "@/components/home/Footer";
import FooterV2 from "@/components/home/FooterV2";
import Desire from "@/components/home/Desire";
import Theory from "@/components/free/theory";
import FeatureV2 from "@/components/home/FeatureV2";
import TheoryTips from "@/components/home/TheoryTips";
import ServiceSection from "@/components/home/service";
import TestimonialSection from "@/components/home/TestimonialSection";
import FortuneTips from "@/components/home/FortuneTips";
import ShopAssistantWidget from "@/components/shop/ShopAssistantWidget";

import { get } from "@/lib/ajax";
export default function Home({ params }) {
	const locale = params?.locale || "zh-TW";
	return (
		<div className="min-h-screen bg-[#EFEFEF]">
			<ShopNavbar />
			<main>
				<section id="hero" style={{ overflow: "hidden" }}>
					<Hero />
				</section>
				{/* <Desire /> */}
				<ServiceSection />
				<TestimonialSection />
				<FortuneTips />
				{/* Hide Tips component on mobile devices */}
				{/* <Message /> */}
			</main>
			<FooterV2 />
			<ShopAssistantWidget locale={locale} />
		</div>
	);
}
