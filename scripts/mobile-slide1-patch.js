const fs = require("fs");
const path = require("path");

const heroPath = path.join(__dirname, "../src/components/home/Hero.jsx");
let s = fs.readFileSync(heroPath, "utf8");

const old =
	"				</div>\n				{/* Bottom Gradient Overlay */}\n				<div\n					className=\"absolute bottom-0 left-0 pointer-events-none right-6 z-5\"\n					style={{\n						height: \"80px\",\n						background:\n							\"linear-gradient(to bottom, transparent 0%, rgba(239, 239, 239, 0.1) 50%, rgba(239, 239, 239, 0.3) 100%)\",\n						borderTopLeftRadius: \"30px\",\n						borderTopRightRadius: \"30px\",\n					}}\n				/>\n			</div>\n		);\n	}\n\n	// DESKTOP LAYOUT";

const newBlock = `				</div>
				</div>

				{/* Mobile Slide 1: same words as image + step container, same level as slide 0 */}
				<div
					className="absolute inset-0 z-[5] transition-opacity duration-500"
					style={{ opacity: mobileHeroSlide === 1 ? 1 : 0, pointerEvents: mobileHeroSlide === 1 ? "auto" : "none" }}
				>
					<div className="absolute inset-0 z-0" style={{ backgroundColor: "#E8E2DA" }}>
						<Image src="/images/hero/hero-bg-2.2-mobile.png" alt="" fill className="object-contain object-center" style={{ objectFit: "contain", objectPosition: "center center" }} />
					</div>
					<div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, transparent 100%)" }} />
					<div className="relative z-10 flex flex-col px-4 py-8 mt-15">
						<div className="flex flex-col pt-5 pb-1 mb-5">
							<h1 className="px-2 text-start font-bold mb-2" style={{ fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif", fontSize: "clamp(28px, 7vw, 42px)", lineHeight: "1.15", color: "#99A800" }}>{t("slide2Title")}</h1>
							<h2 className="px-2 text-start font-bold mb-2" style={{ fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif", fontSize: "clamp(24px, 6vw, 38px)", lineHeight: "1.3", color: "#191A23" }}>{t("slide2Subtitle")}</h2>
							<p className="px-2 text-start text-base font-nano-sans-hk mb-4" style={{ color: "#333" }}>{t("slide2Description")}</p>
							<div className="ml-2">
								<Link href="/shop" className="inline-flex items-center justify-center rounded-full font-bold w-fit transition-transform duration-200 active:scale-95 hover:scale-105" style={{ height: "42px", padding: "0 40px", fontSize: "16px", fontFamily: "noto sans hk", fontWeight: 900, backgroundColor: "#A3B116", letterSpacing: "0.01em", color: "#FFFFFF", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>{t("shopCta")}</Link>
							</div>
						</div>
						<div className="flex flex-col justify-center flex-1 px-2">
							<div className="relative flex flex-row w-full ">
								<div className="relative p-3 border w-[90%] shadow-xl backdrop-blur-sm bg-white/15 border-white/30 rounded-3xl" style={{ minHeight: "180px", height: "180px" }}>
									<div className="grid h-full grid-cols-2 gap-2">
										{steps.map((step) => (
											<div key={step.num} className="relative flex flex-col items-start justify-start p-1 overflow-hidden rounded-xl" style={{ minHeight: "70px" }}>
												<div className="absolute inset-0 z-0 rounded-xl" style={{ backgroundImage: \`url(\${step.image})\`, backgroundSize: "50% auto", backgroundPosition: "85% 30%", backgroundRepeat: "no-repeat", opacity: 0.7 }} />
												<div className="absolute inset-0 flex items-start justify-start z-1" style={{ fontSize: "60px", fontWeight: "900", color: "rgba(232, 226, 218, 0.35)", fontFamily: "Noto Serif TC, serif", lineHeight: "1", pointerEvents: "none" }}>{step.num}</div>
												<div className="relative z-10 flex flex-col items-center justify-center h-full space-y-1 text-center">
													<div className="px-1 space-y-1">
														<h4 className="text-[#FEF8EF] font-bold text-sm sm:text-[20px] leading-tight" style={{ fontFamily: "Noto Sans HK, sans-serif", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{step.title}</h4>
														<p className="text-[#FEF8EF] text-[10px] sm:text-[14px] opacity-90 leading-tight" style={{ fontFamily: "Noto Sans HK, sans-serif", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{step.subtitle}</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
						<div className="flex-shrink-0 h-8" />
					</div>
				</div>

				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3" style={{ pointerEvents: "auto" }}>
					{[0, 1].map((idx) => (
						<button key={idx} type="button" aria-label={idx === 0 ? "Slide 1" : "Slide 2"} onClick={() => setMobileHeroSlide(idx)} className="rounded-full transition-all duration-300" style={{ width: mobileHeroSlide === idx ? 24 : 10, height: 10, backgroundColor: mobileHeroSlide === idx ? "#8DC63F" : "rgba(0,0,0,0.2)" }} />
					))}
				</div>

				<div className="absolute bottom-0 left-0 pointer-events-none right-6 z-5 transition-opacity duration-300" style={{ height: "80px", background: "linear-gradient(to bottom, transparent 0%, rgba(239,239,239,0.1) 50%, rgba(239,239,239,0.3) 100%)", borderTopLeftRadius: "30px", borderTopRightRadius: "30px", opacity: mobileHeroSlide === 0 ? 1 : 0 }} />
			</div>
		);
	}

	// DESKTOP LAYOUT`;

if (s.indexOf(old) === -1) {
	console.error("Pattern not found in Hero.jsx");
	process.exit(1);
}
const out = s.replace(old, newBlock);
fs.writeFileSync(heroPath, out);
console.log("Patched Hero.jsx: added Mobile Slide 1, dots, gradient opacity.");
