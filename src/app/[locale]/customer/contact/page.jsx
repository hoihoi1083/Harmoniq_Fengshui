import { useTranslations } from "next-intl";
import EnquiryForm from "./EnquiryForm";
import ShopNavbar from "@/components/ShopNavbar";

export default function () {
	const t = useTranslations("home.contact");
	return (
		<div
			className="relative min-h-screen"
			style={{
				backgroundImage: "url('/images/hero/contactbg.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Navbar with white text */}
			<div className="absolute top-0 left-0 right-0 z-50">
				<ShopNavbar />
			</div>
			<div className="flex flex-col h-full max-w-full min-h-screen lg:flex-row">
				{/* Content Section */}
				<div className="flex flex-col items-center justify-center w-full px-4 pt-20 pb-10 text-center lg:w-[40%] sm:px-6 lg:px-8 md:items-end lg:items-end lg:text-end lg:pt-0 lg:pb-0">
					<h1
						className="mb-4 text-4xl leading-tight sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl"
						style={{
							fontFamily: "Noto Serif TC, serif",
							WebkitTextStroke: "0.5px white",
							fontWeight: "900",
							color: "white",
						}}
					>
						{t("title")}
					</h1>
					<p
						className="max-w-sm mb-0 text-sm sm:max-w-md lg:max-w-lg sm:text-base lg:text-xl lg:mb-0 md:mb-0"
						style={{
							fontFamily: "DM Sans, sans-serif",
							color: "white",
							lineHeight: "1.6",
						}}
					>
						{t("content")}
					</p>
					<p
						className="max-w-sm mb-4 text-sm sm:max-w-md lg:max-w-lg sm:mb-6 sm:text-base lg:text-xl"
						style={{
							fontFamily: "DM Sans, sans-serif",
							color: "white",
							lineHeight: "1.6",
						}}
					>
						{t("content2")}
					</p>
					<p
						className="max-w-sm text-sm sm:max-w-md lg:max-w-lg sm:text-base lg:text-xl"
						style={{
							fontFamily: "DM Sans, sans-serif",
							color: "white",
							lineHeight: "1.6",
						}}
					>
						{t("content3")}
					</p>
				</div>

				{/* Form Section */}
				<div className="flex items-center justify-center w-full px-2 py-8 lg:w-1/2 sm:px-6 lg:px-8 lg:py-25">
					<EnquiryForm />
				</div>
			</div>

			{/* Social Icons - Responsive Positioning */}
			<div className="absolute z-40 bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8">
				<div className="flex space-x-4 sm:space-x-6">
					<a
						href="https://www.facebook.com/profile.php?id=61578389876952"
						target="_blank"
						rel="noopener noreferrer"
						className="text-white transition-colors duration-200 hover:text-gray-300"
						aria-label="Facebook"
					>
						<svg
							className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
						</svg>
					</a>
					<a
						href="https://www.instagram.com/harmoniq_fengshui/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-white transition-colors duration-200 hover:text-gray-300"
						aria-label="Instagram"
					>
						<svg
							className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	);
}
