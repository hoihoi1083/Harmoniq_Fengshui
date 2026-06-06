export default function WorldCupSectionHeader({ icon = "⚽", title, subtitle, badge }) {
	return (
		<div className="mb-5 flex flex-col gap-3 border-b border-[#0B5E3A]/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div className="flex items-start gap-3">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B5E3A] to-[#064028] text-lg shadow-md sm:h-11 sm:w-11 sm:text-xl">
					{icon}
				</span>
				<div className="min-w-0">
					<h2 className="text-xl font-black text-[#064028] sm:text-2xl">{title}</h2>
					{subtitle && (
						<p className="mt-1 text-xs text-gray-500 sm:text-sm">{subtitle}</p>
					)}
				</div>
			</div>
			{badge && (
				<span className="w-fit shrink-0 rounded-full bg-[#F5C542]/20 px-3 py-1 text-xs font-bold text-[#8A6910]">
					{badge}
				</span>
			)}
		</div>
	);
}
