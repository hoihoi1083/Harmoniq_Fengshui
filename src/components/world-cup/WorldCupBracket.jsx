"use client";

import { buildRoundOf32Fixtures, getGroupQualifiers } from "@/lib/worldCupUtils";
import WorldCupSectionHeader from "./WorldCupSectionHeader";

function TeamChip({ team, placeholder }) {
	if (!team) {
		return (
			<div className="flex min-h-[52px] items-center rounded-xl border border-dashed border-[#0B5E3A]/20 bg-[#F4F9F5] px-3 text-sm text-gray-400">
				{placeholder}
			</div>
		);
	}

	return (
		<div className="flex min-h-[48px] items-center gap-2 rounded-xl border border-[#0B5E3A]/10 bg-white px-2.5 py-2 shadow-sm sm:min-h-[52px] sm:px-3">
			<span className="text-xl sm:text-2xl">{team.flag}</span>
			<div className="min-w-0">
				<p className="truncate text-sm font-bold text-[#064028] sm:text-base">{team.name}</p>
				<p className="truncate text-[10px] text-gray-500 sm:text-xs">{team.nameEn}</p>
			</div>
		</div>
	);
}

export default function WorldCupBracket({ matches }) {
	const qualifiers = getGroupQualifiers(matches);
	const r32 = buildRoundOf32Fixtures(matches);
	const qualifiedCount = Object.keys(qualifiers).length;
	const readyFixtures = r32.filter((f) => f.ready).length;

	return (
		<section className="overflow-hidden rounded-2xl border border-[#0B5E3A]/10 bg-white shadow-md">
			<div className="p-4 sm:p-6">
				<WorldCupSectionHeader
					icon="🏆"
					title="淘汰賽晉級圖"
					subtitle="小組賽結束後，晉級隊伍會自動填入 32 強對陣圖"
				/>

				<div className="mb-6 grid gap-3 sm:grid-cols-3">
					<StatBubble value={qualifiedCount} label="已確定晉級位置" highlight />
					<StatBubble value={readyFixtures} label="32 強已配對場次" />
					<StatBubble value={32} label="淘汰賽首輪總場次" />
				</div>

				<h3 className="mb-3 flex items-center gap-2 text-lg font-black text-[#064028]">
					<span className="rounded bg-[#064028] px-2 py-0.5 text-xs text-[#F5C542]">
						R32
					</span>
					32 強對陣
				</h3>
				<div className="grid gap-4 lg:grid-cols-2">
					{r32.map((fixture) => (
						<div
							key={fixture.slot}
							className={`rounded-2xl border p-4 transition ${
								fixture.ready
									? "border-[#F5C542]/50 bg-gradient-to-br from-[#FFF9E6] to-[#F4F9F5] shadow-sm"
									: "border-[#0B5E3A]/10 bg-[#F4F9F5]"
							}`}
						>
							<div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
								<span className="text-xs font-bold uppercase tracking-wide text-[#0B5E3A]/60">
									Match {fixture.slot}
								</span>
								<span className="w-fit rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-gray-500 shadow-sm sm:text-[11px]">
									{fixture.label}
								</span>
							</div>
							<div className="grid gap-2">
								<TeamChip team={fixture.home} placeholder={`待定 · ${fixture.home}`} />
								<p className="text-center text-xs font-black text-[#F5C542]">⚽ VS ⚽</p>
								<TeamChip team={fixture.away} placeholder={`待定 · ${fixture.away}`} />
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="border-t border-[#0B5E3A]/10 bg-[#F4F9F5] p-4 sm:p-6">
				<h3 className="mb-4 text-base font-black text-[#064028] sm:text-lg">晉級路線</h3>

				{/* Mobile: vertical stages */}
				<div className="flex flex-col gap-2 sm:hidden">
					<Stage label="32 強" active={readyFixtures > 0} detail={`${readyFixtures}/16 場已配對`} mobile />
					<Stage label="16 強" active={false} detail="待定" mobile />
					<Stage label="8 強" active={false} detail="待定" mobile />
					<Stage label="4 強" active={false} detail="待定" mobile />
					<Stage label="🏆 決賽" active={false} detail="2026/7/19" highlight mobile />
				</div>

				{/* Tablet+: horizontal scroll */}
				<div className="hidden overflow-x-auto rounded-2xl border border-[#0B5E3A]/10 bg-white p-4 sm:block">
					<div className="flex min-w-[640px] items-center justify-between gap-2 text-center text-sm lg:min-w-[760px] lg:gap-3">
						<Stage label="32 強" active={readyFixtures > 0} detail={`${readyFixtures}/16 場已配對`} />
						<Arrow />
						<Stage label="16 強" active={false} detail="待定" />
						<Arrow />
						<Stage label="8 強" active={false} detail="待定" />
						<Arrow />
						<Stage label="4 強" active={false} detail="待定" />
						<Arrow />
						<Stage label="🏆 決賽" active={false} detail="2026/7/19" highlight />
					</div>
				</div>
			</div>
		</section>
	);
}

function StatBubble({ value, label, highlight }) {
	return (
		<div
			className={`rounded-xl p-4 text-center ${
				highlight
					? "bg-gradient-to-br from-[#064028] to-[#0B5E3A] text-white"
					: "border border-[#0B5E3A]/10 bg-[#F4F9F5]"
			}`}
		>
			<p className={`text-3xl font-black ${highlight ? "text-[#F5C542]" : "text-[#064028]"}`}>
				{value}
			</p>
			<p className={`mt-1 text-sm ${highlight ? "text-white/70" : "text-gray-600"}`}>
				{label}
			</p>
		</div>
	);
}

function Stage({ label, detail, active, highlight, mobile }) {
	return (
		<div
			className={`rounded-2xl px-4 py-4 sm:py-5 ${
				mobile ? "flex items-center justify-between" : "min-w-[100px] lg:min-w-[110px]"
			} ${
				highlight
					? "bg-gradient-to-br from-[#C9971A] to-[#F5C542] text-[#064028] shadow-md"
					: active
						? "bg-gradient-to-br from-[#064028] to-[#0B5E3A] text-white shadow-md"
						: "border border-[#0B5E3A]/10 bg-white text-gray-700"
			}`}
		>
			<p className="font-black">{label}</p>
			<p
				className={`text-xs ${
					mobile ? "text-right" : "mt-1"
				} ${highlight || active ? "opacity-80" : "text-gray-500"}`}
			>
				{detail}
			</p>
		</div>
	);
}

function Arrow() {
	return <div className="text-xl text-[#F5C542]">→</div>;
}
