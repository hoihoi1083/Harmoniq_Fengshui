"use client";

import { useEffect, useMemo, useState } from "react";
import { use } from "react";
import ShopNavbar from "@/components/ShopNavbar";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";

function toDateInputValue(dateString) {
	if (!dateString) return "";
	const d = new Date(dateString);
	if (Number.isNaN(d.getTime())) return "";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function toTimeInputValue(dateString) {
	if (!dateString) return "";
	const d = new Date(dateString);
	if (Number.isNaN(d.getTime())) return "";
	const h = String(d.getHours()).padStart(2, "0");
	const m = String(d.getMinutes()).padStart(2, "0");
	return `${h}:${m}`;
}

export default function ProfilePage({ params }) {
	const { locale } = use(params);
	const { status } = useSession();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [form, setForm] = useState({
		name: "",
		email: "",
		birthDate: "",
		birthTime: "",
		weeklyAdviceEnabled: true,
	});

	const copy = useMemo(() => {
		if (locale === "zh-CN") {
			return {
				title: "个人资料",
				subtitle: "更新生日与每周风水建议设置",
				name: "姓名",
				email: "Email",
				birthDate: "生日（必填，用于每周建议）",
				birthTime: "出生时间（选填）",
				weeklyAdviceEnabled: "订阅每周风水建议邮件",
				save: "保存资料",
				loginRequired: "请先登录再编辑个人资料。",
				saved: "已保存",
			};
		}

		return {
			title: "個人資料",
			subtitle: "更新生日與每週風水建議設定",
			name: "姓名",
			email: "Email",
			birthDate: "生日（必填，用於每週建議）",
			birthTime: "出生時間（選填）",
			weeklyAdviceEnabled: "訂閱每週風水建議郵件",
			save: "儲存資料",
			loginRequired: "請先登入再編輯個人資料。",
			saved: "已儲存",
		};
	}, [locale]);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/login");
			return;
		}
		if (status !== "authenticated") return;

		let mounted = true;
		const loadProfile = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch("/api/profile", { cache: "no-store" });
				const data = await res.json();
				if (!mounted) return;
				if (!data?.ok) {
					setError(data?.error || "Failed to load profile");
					return;
				}

				const p = data.profile || {};
				setForm({
					name: p.name || "",
					email: p.email || "",
					birthDate: toDateInputValue(p.birthDateTime),
					birthTime: toTimeInputValue(p.birthDateTime),
					weeklyAdviceEnabled: p.weeklyAdviceEnabled !== false,
				});
			} catch (_error) {
				if (mounted) setError("Failed to load profile");
			} finally {
				if (mounted) setLoading(false);
			}
		};

		loadProfile();
		return () => {
			mounted = false;
		};
	}, [status, router]);

	const onChange = (key, value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setMessage("");
		try {
			const birthDateTime = form.birthDate
				? `${form.birthDate}T${form.birthTime || "12:00"}`
				: null;
			const res = await fetch("/api/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name.trim(),
					email: form.email.trim(),
					birthDateTime,
					weeklyAdviceEnabled: form.weeklyAdviceEnabled,
				}),
			});
			const data = await res.json();
			if (!data?.ok) {
				setError(data?.error || "Failed to save profile");
				return;
			}
			setMessage(copy.saved);
		} catch (_error) {
			setError("Failed to save profile");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#f5f5f5]">
			<ShopNavbar />
			<div className="mx-auto max-w-2xl px-4 pb-12 pt-8 md:pt-10">
				<div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm md:p-8">
					<h1 className="text-2xl font-semibold text-[#1f2937]">{copy.title}</h1>
					<p className="mt-2 text-sm text-[#6b7280]">{copy.subtitle}</p>

					{status === "unauthenticated" && (
						<p className="mt-6 rounded-lg bg-[#fff1f2] px-4 py-3 text-sm text-[#b42318]">
							{copy.loginRequired}
						</p>
					)}

					{loading ? (
						<div className="mt-8 text-sm text-[#6b7280]">Loading...</div>
					) : (
						<form onSubmit={onSubmit} className="mt-6 space-y-5">
							<div>
								<label className="mb-1 block text-sm text-[#374151]">
									{copy.name}
								</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => onChange("name", e.target.value)}
									className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#A3B116]"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-[#374151]">
									{copy.email}
								</label>
								<input
									type="email"
									required
									value={form.email}
									onChange={(e) => onChange("email", e.target.value)}
									className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#A3B116]"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-[#374151]">
									{copy.birthDate}
								</label>
								<input
									type="date"
									required
									value={form.birthDate}
									onChange={(e) => onChange("birthDate", e.target.value)}
									className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#A3B116]"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm text-[#374151]">
									{copy.birthTime}
								</label>
								<input
									type="time"
									value={form.birthTime}
									onChange={(e) => onChange("birthTime", e.target.value)}
									className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#A3B116]"
								/>
							</div>

							<label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e5e7eb] px-3 py-3">
								<input
									type="checkbox"
									checked={form.weeklyAdviceEnabled}
									onChange={(e) =>
										onChange("weeklyAdviceEnabled", e.target.checked)
									}
									className="h-4 w-4 accent-[#A3B116]"
								/>
								<span className="text-sm text-[#1f2937]">
									{copy.weeklyAdviceEnabled}
								</span>
							</label>

							{error && (
								<p className="rounded-lg bg-[#fff1f2] px-4 py-3 text-sm text-[#b42318]">
									{error}
								</p>
							)}
							{message && (
								<p className="rounded-lg bg-[#ecfdf3] px-4 py-3 text-sm text-[#027a48]">
									{message}
								</p>
							)}

							<button
								type="submit"
								disabled={saving}
								className="w-full rounded-lg bg-[#A3B116] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#8f9f14] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{saving ? "Saving..." : copy.save}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
