"use client";
import { usePathname } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import Footer from "@/components/home/Footer";

export default function LocaleLayout({ children, params }) {
	const pathname = usePathname();
	const isContactPage = pathname?.includes("/contact");

	return (
		<>
			{!isContactPage && <ShopNavbar />}
			{children}
			{!isContactPage && <Footer />}
		</>
	);
}
