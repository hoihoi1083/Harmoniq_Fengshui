import { useTranslations } from "next-intl";
export default function () {
	const t = useTranslations("home.privacy");
	let arr = Array.from(new Array(4));
	return (
		<div className="py-25 bg-[#EFEFEF] min-h-screen">
			<div className="max-w-4xl px-6 mx-auto">
				<div className="mb-10 text-center">
					<h1 className="mb-2 text-4xl font-bold font-lora text-brown">
						{t("title")}
					</h1>
					<p className="max-w-2xl mx-auto mt-4 mb-2 font-lora text-brown-light">
						{t("description")}
					</p>
					<p>更新日期：2025年【3】月【16】日</p>
					<p>生效日期：2025年【3】月【16】日</p>
				</div>
				<div className="space-y-6">
					{arr.map((section, index) => (
						<section
							key={index}
							className="p-6 bg-white shadow-sm rounded-xl sm:p-8"
						>
							<h2 className="mb-4 text-xl font-semibold font-lora text-brown">
								{t(`block${index + 1}.title`)}
							</h2>
							<div className="space-y-4">
								<p className="whitespace-pre-wrap font-lora text-brown-light">
									{t(`block${index + 1}.content`)}
								</p>
							</div>
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
