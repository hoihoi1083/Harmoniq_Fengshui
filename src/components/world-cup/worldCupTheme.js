/** Shared World Cup 2026 visual tokens */
export const WC = {
	pitch: "#0B5E3A",
	pitchDark: "#064028",
	pitchLight: "#1A7A4C",
	gold: "#F5C542",
	goldDark: "#C9971A",
	night: "#071428",
	white: "#FFFFFF",
	cream: "#F4F9F5",
};

export const HOST_FLAGS = ["🇺🇸", "🇨🇦", "🇲🇽"];
export const HOST_NAMES = ["美國", "加拿大", "墨西哥"];

/** Hero quick-nav → page section ids */
export const HERO_NAV = [
	{ label: "小組賽", target: "wc-groups" },
	{ label: "晉級圖", target: "wc-bracket" },
	{ label: "開運預測", target: "wc-oracle" },
	{ label: "賽程", target: "wc-schedule" },
];

export const SECTION_SCROLL_MARGIN = "scroll-mt-24 sm:scroll-mt-28";

function scrollToSection(id) {
	const el = document.getElementById(id);
	if (!el) return;
	el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export { scrollToSection };
