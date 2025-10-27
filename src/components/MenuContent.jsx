"use client";
import { useEffect, useState } from "react";
import emitter from "@/lib/emitter";
import { EVENT_TRANSLATE_STATUS } from "@/types/constants";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // Add signOut import
import { useRouter } from "@/i18n/navigation"; // Add router for navigation
// Remove this import: import { handleSignOut } from "../app/actions";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

export default function MenuBar({ className, isOpen, setIsOpen, from }) {
	const t = useTranslations("home.hero");
	const t2 = useTranslations("toast");
	const pathname = usePathname();
	const router = useRouter(); // Add router
	const currentLocale = pathname?.split("/")[1] || "zh-TW"; // Extract locale from URL

	const { data: session } = useSession();
	const isLogined = session?.user?.userId;

	const onLoginClick = async () => {
		setIsOpen(false);

		if (isLogined) {
			toast.info(t2("loading"), { autoClose: 2000 });
			try {
				// Use client-side signOut instead of server action
				await signOut({
					redirect: false, // Don't redirect automatically
				});

				// Manually redirect after logout
				router.push("/auth/login");

				// Optional: Show success toast
				toast.success("Logged out successfully", { autoClose: 1000 });
			} catch (error) {
				toast.error("Logout failed", { autoClose: 2000 });
			}
		}
	};

	return (
		<div
			onMouseLeave={() => {
				setIsOpen(false);
			}}
			className={cn(
				"hidden-on-print absolute top-0 right-0 w-full md:w-80 md:shadow-lg bg-white z-20 transition-transform duration-300 ease-in-out",
				isOpen ? "translate-y-0" : "-translate-y-100"
			)}
		>
			<div className="flex justify-between items-center py-4.5 px-4 ">
				<span className="text-[#066952] text-xl font-bold">
					HarmoniQ
				</span>
				<X
					className="w-4 h-4 cursor-pointer"
					onClick={() => setIsOpen(false)}
				/>
			</div>
			{from === "home" ? (
				<button
					className="cursor-pointer block text-base focus:bg-secondary focus:text-primary py-3.5 px-4"
					onClick={onLoginClick}
				>
					{t("logout")}
				</button>
			) : (
				<>
					{/* <Link
						className="block text-base focus:bg-secondary focus:text-primary py-3.5 px-4"
						href="/home"
					>
						{t("home")}
					</Link>
					<Link
						className="block text-base focus:bg-secondary focus:text-primary py-3.5 px-4"
						href="/price"
					>
						{t("pricing")}
					</Link>
					<Link
						className="block text-base focus:bg-secondary focus:text-primary py-3.5 px-4"
						href="/free"
					>
						{t("cta")}
					</Link> */}
					{/* {isLogined && pathname.indexOf("/report") < 0 && (
						<Link
							className="block text-base focus:bg-secondary focus:text-primary py-3.5 px-4"
							href="/report"
						>
							{t("readReport")}
						</Link>
					)} */}

					{/* Report History Link - only show for logged in users */}
					{isLogined && (
						<Link
							className="block text-base focus:bg-secondary focus:text-primary py-3.5 px-4"
							href="/report-history"
							onClick={() => setIsOpen(false)}
						>
							{currentLocale === "zh-CN"
								? "查看报告"
								: "查看報告"}
						</Link>
					)}

					{/* <Select>
						<SelectTrigger className="w-full text-base border-none py-4 mt-1 data-[state=open]:mb-22 px-4 shadow-none data-[state=open]:bg-secondary data-[state=open]:text-primary">
							{t("locale")}
						</SelectTrigger>
						<SelectContent className="border-none shadow-none">
							<Link
								href={`/${pathname.split("/").slice(2).join("/")}`}
								locale="zh-CN"
								className={`block px-4 py-2 text-sm  rounded ${pathname.startsWith("/zh-CN") ? "bg-[#13AB87] text-white" : "text-[#888]"}`}
							>
								简体中文
							</Link>
							<Link
								href={`/${pathname.split("/").slice(2).join("/")}`}
								locale="zh-TW"
								className={`block px-4 py-2 text-sm  rounded ${pathname.startsWith("/zh-TW") ? "bg-[#13AB87] text-white" : "text-[#888]"}`}
							>
								繁體中文
							</Link>
						</SelectContent>
					</Select> */}
					{pathname.indexOf("/login") < 0 && (
						<Link
							className="block text-base focus:bg-secondary focus:text-primary py-3.5 px-4"
							href={"/auth/login"}
							onClick={onLoginClick}
						>
							{isLogined ? t("logout") : t("login")}
						</Link>
					)}
				</>
			)}
		</div>
	);
}
