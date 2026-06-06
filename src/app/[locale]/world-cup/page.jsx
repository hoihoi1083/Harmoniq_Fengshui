"use client";

import { useState } from "react";
import ShopNavbar from "@/components/ShopNavbar";
import FooterV2 from "@/components/home/FooterV2";
import WorldCupHero from "@/components/world-cup/WorldCupHero";
import WorldCupGroups from "@/components/world-cup/WorldCupGroups";
import WorldCupBracket from "@/components/world-cup/WorldCupBracket";
import WorldCupBirthdayOracle from "@/components/world-cup/WorldCupBirthdayOracle";
import { INITIAL_MATCHES, getTeamById } from "@/data/worldCup2026";
import { getTonightMatches } from "@/lib/worldCupUtils";
import { SECTION_SCROLL_MARGIN } from "@/components/world-cup/worldCupTheme";

export default function WorldCupPage() {
	const [matches] = useState(INITIAL_MATCHES);
	const [selectedGroup, setSelectedGroup] = useState("A");

	const finished = matches.filter((m) => m.status === "finished");
	const tonight = getTonightMatches(matches);

	return (
		<div className="min-h-screen bg-[#E8F2EC]">
			{/* Subtle pitch texture on page bg */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.04]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(0deg, #0B5E3A, #0B5E3A 40px, transparent 40px, transparent 80px)",
				}}
			/>

			<ShopNavbar />

			<main className="container relative mx-auto max-w-6xl px-3 pb-12 pt-10 sm:px-4 sm:pb-16 sm:pt-10">
				<WorldCupHero />

				<div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:gap-4">
					<StatCard
						icon="🌍"
						label="參賽隊伍"
						value="48"
						sub="史上最大規模"
					/>
					<StatCard
						icon="🏟️"
						label="小組"
						value="12"
						sub="A – L 組"
					/>
					<StatCard
						icon="⚽"
						label="已完成賽事"
						value={String(finished.length)}
						sub="即時更新"
					/>
				</div>

				<div className="space-y-6 sm:space-y-8">
					<div id="wc-oracle" className={SECTION_SCROLL_MARGIN}>
						<WorldCupBirthdayOracle matches={matches} />
					</div>

					<div id="wc-groups" className={SECTION_SCROLL_MARGIN}>
						<WorldCupGroups
							matches={matches}
							selectedGroup={selectedGroup}
							onSelectGroup={setSelectedGroup}
						/>
					</div>

					<RecentResults matches={finished} />

					<div id="wc-schedule" className={SECTION_SCROLL_MARGIN}>
						<UpcomingStrip
							date={tonight.date}
							matches={tonight.matches}
						/>
					</div>

					<div id="wc-bracket" className={SECTION_SCROLL_MARGIN}>
						<WorldCupBracket matches={matches} />
					</div>
				</div>
			</main>

			<FooterV2 />
		</div>
	);
}

function StatCard({ icon, label, value, sub }) {
	return (
		<div className="relative overflow-hidden rounded-xl border border-[#0B5E3A]/10 bg-white p-3 shadow-md sm:rounded-2xl sm:p-5">
			<div className="absolute -right-3 -top-3 text-4xl opacity-[0.06] sm:-right-4 sm:-top-4 sm:text-6xl">
				{icon}
			</div>
			<p className="text-[11px] font-semibold text-[#0B5E3A]/70 sm:text-sm">
				{label}
			</p>
			<p className="mt-0.5 text-2xl font-black text-[#064028] sm:mt-1 sm:text-4xl">
				{value}
			</p>
			{sub && (
				<p className="mt-0.5 hidden text-xs text-gray-400 sm:block">
					{sub}
				</p>
			)}
			<div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#0B5E3A] to-[#F5C542]" />
		</div>
	);
}

function RecentResults({ matches }) {
	if (!matches.length) return null;

	return (
		<section className="overflow-hidden rounded-2xl border border-[#0B5E3A]/10 bg-white shadow-md">
			<div className="bg-gradient-to-r from-[#064028] to-[#0B5E3A] px-4 py-3 sm:px-6 sm:py-4">
				<h2 className="flex items-center gap-2 text-lg font-black text-white sm:text-xl">
					<span>📋</span> 最新賽果
				</h2>
			</div>
			<div className="grid gap-3 p-4 sm:p-6 md:grid-cols-2">
				{matches.map((match) => {
					const home = getTeamById(match.homeId);
					const away = getTeamById(match.awayId);
					return (
						<div
							key={match.id}
							className="rounded-xl border border-[#0B5E3A]/10 bg-[#F4F9F5] p-3 sm:p-4"
						>
							<div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
								<span className="text-lg sm:text-xl">
									{home?.flag}
								</span>
								<span className="text-sm font-bold text-[#064028] sm:text-base">
									{home?.name}
								</span>
								<span className="rounded-lg bg-[#064028] px-2 py-0.5 text-sm font-black text-[#F5C542]">
									{match.homeScore} – {match.awayScore}
								</span>
								<span className="text-sm font-bold text-[#064028] sm:text-base">
									{away?.name}
								</span>
								<span className="text-lg sm:text-xl">
									{away?.flag}
								</span>
							</div>
							<p className="text-center text-xs text-gray-400 sm:text-left">
								{match.date}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function UpcomingStrip({ date, matches }) {
	return (
		<section className="overflow-hidden rounded-2xl border border-[#F5C542]/30 bg-gradient-to-r from-[#FFF9E6] to-[#F4F9F5] shadow-md">
			<div className="flex items-center gap-2 border-b border-[#F5C542]/20 px-4 py-3 sm:px-6 sm:py-4">
				<span className="text-lg sm:text-xl">📅</span>
				<h2 className="text-base font-black text-[#064028] sm:text-xl">
					{date ? `${date} 賽程` : "即將開賽"}
				</h2>
			</div>
			{matches.length === 0 ? (
				<p className="p-4 text-center text-sm text-gray-500 sm:p-6">
					暫無排定賽程，開賽後會在此顯示。
				</p>
			) : (
				<div className="grid gap-2 p-4 sm:flex sm:flex-wrap sm:gap-3 sm:p-6">
					{matches.map((match) => {
						const home = getTeamById(match.homeId);
						const away = getTeamById(match.awayId);
						return (
							<div
								key={match.id}
								className="rounded-xl border border-[#0B5E3A]/10 bg-white px-3 py-2.5 text-sm shadow-sm sm:px-4 sm:py-3"
							>
								<p className="font-bold leading-snug text-[#064028]">
									{home?.flag} {home?.name}{" "}
									<span className="text-gray-400">vs</span>{" "}
									{away?.name} {away?.flag}
								</p>
								<p className="mt-1 text-xs text-gray-500">
									🕐 {match.kickoff} · 組 {match.groupId}
								</p>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
