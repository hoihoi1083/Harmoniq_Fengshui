"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { predictTonightByBirthday } from "@/lib/worldCupUtils";

export default function WorldCupBirthdayOracle({ matches }) {
	const [birthDate, setBirthDate] = useState("");
	const [birthTime, setBirthTime] = useState("12:00");
	const [submitted, setSubmitted] = useState(false);

	const result = useMemo(() => {
		if (!submitted || !birthDate) return null;
		const birthDateTime = `${birthDate}T${birthTime || "12:00"}`;
		return predictTonightByBirthday(birthDateTime, matches);
	}, [submitted, birthDate, birthTime, matches]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!birthDate) return;
		setSubmitted(true);
	};

	return (
		<section className="relative overflow-hidden rounded-2xl border border-[#F5C542]/30 shadow-xl">
			{/* Stadium night background */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#071428] via-[#0B5E3A] to-[#064028]" />
			<div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#F5C542]/10 blur-3xl" />
			<div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
			<div
				className="pointer-events-none absolute inset-0 opacity-10"
				style={{
					backgroundImage:
						"repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)",
				}}
			/>

			<div className="relative z-10 p-4 sm:p-6 md:p-8">
				<div className="mb-5 flex flex-wrap items-start gap-4">
					<div>
						<p className="text-3xl font-bold uppercase tracking-[0.25em] text-[#F5C542]">
							開運預測
						</p>
						<h2 className="mt-1 text-xl font-black text-white sm:text-2xl md:text-3xl">
							生日運勢 · 今晚誰會贏？ ⚽
						</h2>
						<p className="mt-2 max-w-2xl text-sm text-white/70">
							輸入你的出生日期，我們會用八字五行與球隊能量做個趣味配對，看看今晚哪支球隊更合你的磁場。
						</p>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm md:grid-cols-[1fr_1fr_auto]"
				>
					<div>
						<label className="mb-2 block text-sm font-semibold text-[#F5C542]">
							🎂 出生日期
						</label>
						<Input
							type="date"
							value={birthDate}
							onChange={(e) => {
								setBirthDate(e.target.value);
								setSubmitted(false);
							}}
							className="border-white/20 bg-white/95 text-[#064028]"
							required
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-semibold text-white/70">
							🕐 出生時間（選填）
						</label>
						<Input
							type="time"
							value={birthTime}
							onChange={(e) => {
								setBirthTime(e.target.value);
								setSubmitted(false);
							}}
							className="border-white/20 bg-white/95 text-[#064028]"
						/>
					</div>
					<div className="flex items-end">
						<Button
							type="submit"
							className="w-full bg-gradient-to-r from-[#F5C542] to-[#C9971A] font-bold text-[#064028] hover:opacity-90 md:w-auto"
						>
							⚽ 開運預測
						</Button>
					</div>
				</form>

				{submitted && result && (
					<div className="mt-6 space-y-4">
						{result.predictions.length === 0 ? (
							<div className="rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
								目前沒有排定的比賽。世足開賽後再來試試！
							</div>
						) : (
							<>
								<p className="flex items-center gap-2 text-sm font-bold text-[#F5C542]">
									<span>📅</span>
									{result.date} 今晚 / 下一個比賽日
								</p>
								{result.predictions.map((item) => {
									if (!item) return null;
									const {
										match,
										home,
										away,
										predictedWinner,
										baziLine,
										reason,
										confidence,
									} = item;
									return (
										<div
											key={match.id}
											className="overflow-hidden rounded-2xl bg-white shadow-lg"
										>
											<div className="bg-gradient-to-r from-[#064028] to-[#0B5E3A] px-5 py-3">
												<div className="flex flex-wrap items-center justify-between gap-2">
													<span className="rounded-full bg-[#F5C542]/20 px-3 py-1 text-xs font-bold text-[#F5C542]">
														🕐 {match.kickoff} · 組{" "}
														{match.groupId}
													</span>
													<span className="text-xs text-white/60">
														信心值 {confidence}%
													</span>
												</div>
											</div>
											<div className="p-4 sm:p-5">
												<div className="mb-4 space-y-2 sm:space-y-0 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-3">
													<TeamCard
														team={home}
														highlight={
															predictedWinner.id ===
															home.id
														}
													/>
													<div className="py-1 text-center text-base font-black text-[#F5C542] sm:text-lg">
														VS
													</div>
													<TeamCard
														team={away}
														highlight={
															predictedWinner.id ===
															away.id
														}
													/>
												</div>
												<div className="rounded-xl border border-[#F5C542]/30 bg-gradient-to-r from-[#FFF9E6] to-[#F4F9F5] p-4">
													<p className="text-sm font-black text-[#064028]">
														🏆 你的開運之選：
														{
															predictedWinner.flag
														}{" "}
														{predictedWinner.name}
													</p>
													<p className="mt-2 text-sm text-gray-600">
														{reason}
													</p>
													<p className="mt-2 text-xs text-gray-400">
														八字：{baziLine}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</>
						)}
					</div>
				)}
			</div>

			<div className="relative z-10 h-1 bg-gradient-to-r from-[#C9971A] via-[#F5C542] to-[#C9971A]" />
		</section>
	);
}

function TeamCard({ team, highlight }) {
	if (!team) return null;
	return (
		<div
			className={`flex flex-wrap items-center gap-2 rounded-xl border p-2.5 sm:gap-3 sm:p-3 ${
				highlight
					? "border-[#F5C542] bg-[#FFF9E6] shadow-md ring-2 ring-[#F5C542]/30"
					: "border-[#0B5E3A]/10 bg-[#F4F9F5]"
			}`}
		>
			<span className="text-2xl sm:text-3xl">{team.flag}</span>
			<div className="min-w-0 flex-1">
				<p className="truncate font-bold text-[#064028]">{team.name}</p>
				<p className="truncate text-xs text-gray-500">{team.nameEn}</p>
			</div>
			{highlight && (
				<span className="rounded-full bg-[#064028] px-2 py-1 text-[10px] font-bold text-[#F5C542]">
					今晚之選
				</span>
			)}
		</div>
	);
}
