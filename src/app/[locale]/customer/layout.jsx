"use client";
import { usePathname } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import Footer from "@/components/home/Footer";
import FooterV2 from "@/components/home/FooterV2";

export default function LocaleLayout({ children, params }) {
	const pathname = usePathname();
	const isContactPage = pathname?.includes("/contact");

	return (
		<>
			{!isContactPage && <ShopNavbar />}
			{children}
			{!isContactPage && <FooterV2 />}
		</>
	);
}
