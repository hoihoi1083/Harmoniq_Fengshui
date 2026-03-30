"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Send, Loader2 } from "lucide-react";

/** 小風購物助理浮動按鈕圖示 */
const LAUNCHER_IMAGE_SRC = "/images/風水妹/小風.png";

function renderTextWithLinks(text) {
	if (!text) return null;
	const re = /\[([^\]]+)\]\(([^)]+)\)/g;
	const out = [];
	let last = 0;
	let m;
	let key = 0;
	while ((m = re.exec(text)) !== null) {
		if (m.index > last) {
			out.push(
				<span key={`t-${key++}`} className="whitespace-pre-wrap">
					{text.slice(last, m.index)}
				</span>,
			);
		}
		const href = m[2].startsWith("/") ? m[2] : `/${m[2]}`;
		out.push(
			<Link
				key={`l-${key++}`}
				href={href}
				className="font-medium text-[#6B8E23] underline underline-offset-2 hover:text-[#5a7320]"
			>
				{m[1]}
			</Link>,
		);
		last = m.index + m[0].length;
	}
	if (last < text.length) {
		out.push(
			<span key={`t-${key++}`} className="whitespace-pre-wrap">
				{text.slice(last)}
			</span>,
		);
	}
	return out.length ? out : text;
}

export default function ShopAssistantWidget({ locale }) {
	const isCn = locale === "zh-CN";
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState(() => [
		{
			role: "assistant",
			content: isCn
				? "嗨，我是小风～今天想买什么或想改善哪方面运势？可以聊聊近况（财运、感情、送礼等）；若愿意附上公历生日（例 1990-05-15），我会结合系统五行参考帮你挑款并说明理由。"
				: "嗨，我是小風～今天想挑什麼好物呢？可以聊聊近況（財運、感情、送禮等）；若願意附上公曆生日（例 1990-05-15），我會結合系統五行參考幫你挑款並說明理由。",
		},
	]);
	const [loading, setLoading] = useState(false);
	const scrollRef = useRef(null);
	const typingTimerRef = useRef(null);
	const typingMsgIdRef = useRef(null);

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			if (scrollRef.current) {
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			}
		});
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, open, loading]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	useEffect(() => {
		return () => {
			if (typingTimerRef.current) clearInterval(typingTimerRef.current);
		};
	}, []);

	const send = useCallback(async () => {
		const trimmed = input.trim();
		if (!trimmed || loading) return;

		const userMsg = { role: "user", content: trimmed };
		const historyForApi = [...messages, userMsg].map(({ role, content }) => ({
			role,
			content,
		}));
		setInput("");
		setMessages((prev) => [...prev, userMsg]);
		setLoading(true);

		try {

			const res = await fetch("/api/shop/assistant", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: historyForApi, locale }),
			});

			const data = await res.json();
			if (!data.success) {
				throw new Error(data.error || "request failed");
			}

			// Typewriter effect: show assistant reply progressively
			const full = String(data.reply || "");
			const msgId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
			typingMsgIdRef.current = msgId;

			setMessages((prev) => [...prev, { role: "assistant", content: "", _id: msgId }]);

			if (typingTimerRef.current) clearInterval(typingTimerRef.current);

			let i = 0;
			const step = () => {
				// If a newer message started typing, stop.
				if (typingMsgIdRef.current !== msgId) {
					if (typingTimerRef.current) clearInterval(typingTimerRef.current);
					return;
				}
				i += Math.max(1, Math.floor(full.length / 120));
				const slice = full.slice(0, i);
				setMessages((prev) =>
					prev.map((m) => (m._id === msgId ? { ...m, content: slice } : m)),
				);
				if (i >= full.length) {
					if (typingTimerRef.current) clearInterval(typingTimerRef.current);
				}
			};

			// Faster than "word by word" but visually feels like streaming.
			typingTimerRef.current = setInterval(step, 20);
			step();
		} catch {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: isCn
						? "剛剛連線有點不穩，請稍後再試一次，或刷新頁面後再跟我聊～"
						: "剛剛連線有點不穩，請稍後再試一次，或刷新頁面後再跟我聊～",
				},
			]);
		} finally {
			setLoading(false);
		}
	}, [input, loading, messages, locale]);

	return (
		<div
			className="fixed z-[100] flex flex-col items-end gap-3 pointer-events-none"
			style={{
				bottom: "max(1.25rem, env(safe-area-inset-bottom))",
				right: "max(1rem, env(safe-area-inset-right))",
			}}
		>
			{open && (
				<div
					className="pointer-events-auto flex w-[min(100vw-1.5rem,400px)] max-h-[min(72vh,520px)] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-4 duration-200"
					role="dialog"
					aria-label={isCn ? "小风购物助理" : "小風購物助理"}
				>
					<div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-[#f7f8f3] to-white px-4 py-3">
						<div className="min-w-0">
							<p className="text-base font-semibold text-[#073E31]">
								{isCn ? "小风 · 购物助理" : "小風 · 購物助理"}
							</p>
							<p className="truncate text-xs text-gray-500">
								{isCn
									? "帮你挑水晶与好物 · 仅供参考"
									: "幫你挑水晶與好物 · 僅供參考"}
							</p>
						</div>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
							aria-label={isCn ? "关闭" : "關閉"}
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div
						ref={scrollRef}
						className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3"
					>
						{messages.map((m, i) => (
							<div
								key={i}
								className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
										m.role === "user"
											? "bg-[#7E8A00] text-white rounded-br-md"
											: "bg-gray-100 text-gray-800 rounded-bl-md"
									}`}
								>
									{m.role === "assistant" ? (
										<div className="break-words">
											{renderTextWithLinks(m.content)}
										</div>
									) : (
										<span className="whitespace-pre-wrap">
											{m.content}
										</span>
									)}
								</div>
							</div>
						))}
						{loading && (
							<div className="flex justify-start">
								<div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-sm text-gray-600">
									<Loader2 className="h-4 w-4 animate-spin" />
									{isCn ? "小风正在想…" : "小風正在想…"}
								</div>
							</div>
						)}
					</div>

					<div className="shrink-0 border-t border-gray-100 p-3">
						<div className="flex gap-2">
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										send();
									}
								}}
								placeholder={
									isCn
										? "说说需求、预算，或附上生日如 1990-05-15…"
										: "說說需求、預算，或附上生日如 1990-05-15…"
								}
								className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none ring-[#7E8A00]/30 focus:border-[#7E8A00] focus:ring-2"
								disabled={loading}
								maxLength={2000}
							/>
							<button
								type="button"
								onClick={send}
								disabled={loading || !input.trim()}
								className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7E8A00] text-white transition hover:bg-[#6a7400] disabled:opacity-40"
								aria-label={isCn ? "发送" : "發送"}
							>
								<Send className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>
			)}

			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-white p-1.5 pr-3 shadow-lg shadow-[#A3B116]/25 transition hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7E8A00]"
				aria-expanded={open}
				aria-label={isCn ? "打开小风购物助理" : "開啟小風購物助理"}
			>
				<span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[#A3B116]/40">
					<Image
						src={LAUNCHER_IMAGE_SRC}
						alt=""
						width={56}
						height={56}
						className="h-full w-full object-cover"
					/>
				</span>
				<span className="hidden text-sm font-semibold text-[#073E31] sm:inline">
					{isCn ? "小风" : "小風"}
				</span>
			</button>
		</div>
	);
}
