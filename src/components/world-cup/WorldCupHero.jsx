"use client";

import { useEffect, useState } from "react";
import { OPENING_MATCH, TOURNAMENT, getTeamById } from "@/data/worldCup2026";
import { HERO_NAV, HOST_FLAGS, HOST_NAMES, scrollToSection } from "./worldCupTheme";

function getCountdown(target) {
	const diff = Math.max(0, target.getTime() - Date.now());
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
	const mins = Math.floor((diff / (1000 * 60)) % 60);
	const secs = Math.floor((diff / 1000) % 60);
	return { days, hours, mins, secs, started: diff === 0 };
}

export default function WorldCupHero() {
	const kickoff = new Date(OPENING_MATCH.kickoffUtc);
	const [countdown, setCountdown] = useState(getCountdown(kickoff));
	const home = getTeamById(OPENING_MATCH.homeId);
	const away = getTeamById(OPENING_MATCH.awayId);

	useEffect(() => {
		const timer = setInterval(() => setCountdown(getCountdown(kickoff)), 1000);
		return () => clearInterval(timer);
	}, [kickoff]);

	return (
		<section className="relative mb-6 overflow-hidden rounded-2xl shadow-2xl sm:mb-10 sm:rounded-3xl">
			<div className="absolute inset-0 bg-gradient-to-br from-[#064028] via-[#0B5E3A] to-[#0A3D5C]" />
			<div
				className="absolute inset-0 opacity-20"
				style={{
					backgroundImage:
						"repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.08) 48px, rgba(255,255,255,0.08) 96px)",
				}}
			/>
			<div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
			<div className="pointer-events-none absolute -right-10 top-0 h-72 w-72 rounded-full bg-[#F5C542]/15 blur-3xl" />

			{/* Hide large pitch circle on small screens */}
			<div className="pointer-events-none absolute right-[-80px] top-1/2 hidden h-[220px] w-[220px] -translate-y-1/2 rounded-full border-2 border-white/10 sm:block md:h-[280px] md:w-[280px]" />

			<span className="pointer-events-none absolute right-4 top-4 text-5xl opacity-20 sm:right-8 sm:top-8 sm:text-6xl md:text-8xl">
				⚽
			</span>

			<div className="relative z-10 px-4 py-8 sm:px-6 sm:py-10 md:px-12 md:py-14">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
					<div className="min-w-0 max-w-2xl">
						<div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
							<span className="w-fit rounded-full border border-[#F5C542]/50 bg-[#F5C542]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F5C542] sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.25em]">
								FIFA World Cup 2026™
							</span>
							<div className="flex w-fit items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur-sm">
								{HOST_FLAGS.map((flag, i) => (
									<span key={HOST_NAMES[i]} title={HOST_NAMES[i]} className="text-base sm:text-lg">
										{flag}
									</span>
								))}
								<span className="ml-1 text-xs text-white/70">合辦</span>
							</div>
						</div>

						<h1 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-6xl">
							<span className="block">2026</span>
							<span className="bg-gradient-to-r from-white via-white to-[#F5C542] bg-clip-text text-transparent">
								世界盃專區
							</span>
						</h1>

						<p className="mt-3 text-sm text-white/85 sm:mt-4 sm:text-base md:text-lg">
							{TOURNAMENT.hosts.join(" · ")}
							<span className="hidden sm:inline"> · </span>
							<span className="block sm:inline">
								{TOURNAMENT.startDate} – {TOURNAMENT.endDate}
							</span>
						</p>
						<p className="mt-2 max-w-xl text-xs text-white/60 sm:text-sm">
							12 組 · 48 隊 · 104 場比賽 — 小組積分榜、晉級圖、生日開運預測，一站睇晒。
						</p>

						<nav
							className="mt-4 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2"
							aria-label="世界盃專區快速導航"
						>
							{HERO_NAV.map(({ label, target }) => (
								<button
									key={target}
									type="button"
									onClick={() => scrollToSection(target)}
									className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition hover:border-[#F5C542]/60 hover:bg-[#F5C542]/20 hover:text-white active:scale-95 sm:px-3 sm:py-1 sm:text-xs"
								>
									{label}
								</button>
							))}
						</nav>
					</div>

					<div className="w-full shrink-0 rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md sm:p-6 lg:w-auto lg:min-w-[280px]">
						<p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#F5C542] sm:text-xs">
							{countdown.started ? "已開賽" : "距離開幕"}
						</p>
						{countdown.started ? (
							<p className="mt-3 text-center text-xl font-black text-white sm:text-2xl">
								⚽ 世足進行中
							</p>
						) : (
							<div className="mt-3 grid grid-cols-4 gap-1.5 text-center sm:mt-4 sm:gap-2">
								<CountdownUnit value={countdown.days} label="天" />
								<CountdownUnit value={countdown.hours} label="時" />
								<CountdownUnit value={countdown.mins} label="分" />
								<CountdownUnit value={countdown.secs} label="秒" />
							</div>
						)}
						<p className="mt-3 text-center text-[11px] text-white/50 sm:mt-4 sm:text-xs">
							開幕戰 · {home?.name} vs {away?.name}
						</p>
						<p className="text-center text-[11px] text-white/40 sm:text-xs">
							{OPENING_MATCH.date.replace(/-/g, "/")} {OPENING_MATCH.kickoffLocal}（{OPENING_MATCH.venueNote}）
						</p>
					</div>
				</div>
			</div>

			<div className="h-1.5 bg-gradient-to-r from-[#C9971A] via-[#F5C542] to-[#C9971A]" />
		</section>
	);
}

function CountdownUnit({ value, label }) {
	return (
		<div className="rounded-xl bg-white/10 px-1 py-2 sm:px-2 sm:py-3">
			<p className="text-2xl font-black tabular-nums text-white sm:text-3xl">{value}</p>
			<p className="mt-0.5 text-[9px] uppercase tracking-wider text-white/50 sm:mt-1 sm:text-[10px]">
				{label}
			</p>
		</div>
	);
}
