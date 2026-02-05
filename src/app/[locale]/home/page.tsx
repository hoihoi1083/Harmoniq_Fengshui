import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Share from "@/components/home/Share";
import BeforeAfter from "@/components/home/BeforeAfter";
import Comments from "@/components/home/Comments";
import Tips from "@/components/home/Tips";
import FAQ from "@/components/home/FAQ";
import Message from "@/components/home/Message";
import Footer from "@/components/home/Footer";
import Desire from "@/components/home/Desire";
import Theory from "@/components/free/theory";
import FeatureV2 from "@/components/home/FeatureV2";
import TheoryTips from "@/components/home/TheoryTips";
import ServiceSection from "@/components/home/service";
import TestimonialSection from "@/components/home/TestimonialSection";

import { get } from "@/lib/ajax";
export default function Home() {
	return (
		<div className="min-h-screen bg-[#EFEFEF]">
			<Navbar from="home" />
			<main>
				<section id="hero" style={{ overflow: "hidden" }}>
					<Hero />
				</section>
				{/* <Desire /> */}
				<ServiceSection />
				<TestimonialSection />
				<div className="lg:-mt-[100px] md:-mt-[80px] sm:mt-0 w-full overflow-hidden">
					{/* <FeatureV2 /> */}
				</div>
				<div className="w-full overflow-hidden">
					<TheoryTips />
				</div>
				{/* Hide Tips component on mobile devices */}
				{/* <Message /> */}
				<section id="faq">
					<FAQ />
				</section>
			</main>
			<Footer />
		</div>
	);
}
