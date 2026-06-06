"use client";

import { GROUPS } from "@/data/worldCup2026";
import { computeGroupStandings, isGroupComplete } from "@/lib/worldCupUtils";
import WorldCupSectionHeader from "./WorldCupSectionHeader";

export default function WorldCupGroups({ matches, selectedGroup, onSelectGroup }) {
	const groupIds = Object.keys(GROUPS);
	const activeId = selectedGroup || groupIds[0];
	const standings = computeGroupStandings(activeId, matches);
	const complete = isGroupComplete(activeId, matches);

	return (
		<section className="overflow-hidden rounded-2xl border border-[#0B5E3A]/10 bg-white shadow-md">
			<div className="p-4 sm:p-6">
				<WorldCupSectionHeader
					icon="🏟️"
					title="小組賽分組"
					subtitle="48 隊 · 12 組 · 前兩名晉級 32 強（積分榜隨賽果自動更新）"
					badge={complete ? "晉級隊伍已更新" : null}
				/>

				{/* Horizontal scroll group tabs on mobile */}
				<div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] md:flex-wrap md:overflow-visible">
					{groupIds.map((id) => (
						<button
							key={id}
							type="button"
							onClick={() => onSelectGroup?.(id)}
							className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition sm:px-4 sm:py-2 ${
								activeId === id
									? "bg-gradient-to-r from-[#064028] to-[#0B5E3A] text-[#F5C542] shadow-md"
									: "border border-[#0B5E3A]/15 bg-[#F4F9F5] text-[#064028] hover:bg-[#E8F2EC]"
							}`}
						>
							組 {id}
						</button>
					))}
				</div>

				<div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-3 lg:grid-cols-4">
					{GROUPS[activeId].teams.map((team) => (
						<div
							key={team.id}
							className="flex items-center gap-2 rounded-xl border border-[#0B5E3A]/10 bg-gradient-to-br from-[#F4F9F5] to-white p-2.5 shadow-sm sm:gap-3 sm:p-3"
						>
							<span className="text-2xl sm:text-3xl">{team.flag}</span>
							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-[#064028] sm:text-base">
									{team.name}
								</p>
								<p className="truncate text-[10px] text-gray-500 sm:text-xs">
									{team.nameEn}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Mobile: card standings */}
			<div className="space-y-2 px-4 pb-4 md:hidden">
				{standings.map((row, index) => (
					<StandingCard key={row.id} row={row} rank={index + 1} qualified={index < 2 && row.played > 0} />
				))}
			</div>

			{/* Desktop: table */}
			<div className="hidden overflow-x-auto md:block">
				<p className="px-4 pb-2 text-xs text-gray-400 lg:hidden">
					← 左右滑動查看完整積分榜 →
				</p>
				<table className="min-w-[640px] w-full text-sm">
					<thead>
						<tr className="bg-gradient-to-r from-[#064028] to-[#0B5E3A] text-left text-white">
							<th className="py-3 pl-4 pr-3 font-semibold lg:pl-6">#</th>
							<th className="py-3 pr-4 font-semibold">球隊</th>
							<th className="px-2 py-3 text-center font-semibold">賽</th>
							<th className="px-2 py-3 text-center font-semibold">勝</th>
							<th className="px-2 py-3 text-center font-semibold">和</th>
							<th className="px-2 py-3 text-center font-semibold">負</th>
							<th className="px-2 py-3 text-center font-semibold">入</th>
							<th className="px-2 py-3 text-center font-semibold">失</th>
							<th className="px-2 py-3 text-center font-semibold">淨</th>
							<th className="py-3 pl-2 pr-4 text-center font-bold text-[#F5C542] lg:pr-6">分</th>
						</tr>
					</thead>
					<tbody>
						{standings.map((row, index) => (
							<tr
								key={row.id}
								className={`border-b border-[#0B5E3A]/5 last:border-0 ${
									index < 2 && row.played > 0
										? "bg-[#F5C542]/10"
										: index % 2 === 0
											? "bg-white"
											: "bg-[#F4F9F5]/50"
								}`}
							>
								<td className="py-3 pl-4 pr-3 font-bold text-[#064028] lg:pl-6">{index + 1}</td>
								<td className="py-3 pr-4">
									<span className="mr-1.5 text-lg">{row.flag}</span>
									<span className="font-semibold text-[#064028]">{row.name}</span>
									{index < 2 && row.played > 0 && (
										<span className="ml-1.5 rounded-full bg-[#064028] px-2 py-0.5 text-[10px] font-bold text-[#F5C542]">
											晉級
										</span>
									)}
								</td>
								<td className="px-2 text-center">{row.played}</td>
								<td className="px-2 text-center">{row.won}</td>
								<td className="px-2 text-center">{row.drawn}</td>
								<td className="px-2 text-center">{row.lost}</td>
								<td className="px-2 text-center">{row.gf}</td>
								<td className="px-2 text-center">{row.ga}</td>
								<td className="px-2 text-center">{row.gd}</td>
								<td className="py-3 pl-2 pr-4 text-center text-lg font-black text-[#064028] lg:pr-6">
									{row.points}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

function StandingCard({ row, rank, qualified }) {
	return (
		<div
			className={`rounded-xl border p-3 ${
				qualified
					? "border-[#F5C542]/40 bg-[#FFF9E6]"
					: "border-[#0B5E3A]/10 bg-[#F4F9F5]"
			}`}
		>
			<div className="mb-2 flex items-center justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2">
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#064028] text-xs font-black text-[#F5C542]">
						{rank}
					</span>
					<span className="text-xl">{row.flag}</span>
					<span className="truncate font-bold text-[#064028]">{row.name}</span>
				</div>
				<div className="shrink-0 text-right">
					<p className="text-2xl font-black leading-none text-[#064028]">{row.points}</p>
					<p className="text-[10px] text-gray-500">分</p>
				</div>
			</div>
			{qualified && (
				<span className="mb-2 inline-block rounded-full bg-[#064028] px-2 py-0.5 text-[10px] font-bold text-[#F5C542]">
					晉級區
				</span>
			)}
			<div className="grid grid-cols-4 gap-1 text-center text-[11px] text-gray-600">
				<MiniStat label="賽" value={row.played} />
				<MiniStat label="勝" value={row.won} />
				<MiniStat label="和" value={row.drawn} />
				<MiniStat label="負" value={row.lost} />
				<MiniStat label="入球" value={row.gf} />
				<MiniStat label="失球" value={row.ga} />
				<MiniStat label="淨勝" value={row.gd} />
			</div>
		</div>
	);
}

function MiniStat({ label, value }) {
	return (
		<div className="rounded-lg bg-white/80 px-1 py-1.5">
			<p className="font-bold text-[#064028]">{value}</p>
			<p className="text-[9px] text-gray-400">{label}</p>
		</div>
	);
}
