export const FLYING_STARS_2025 = {
	northEast: { star: "五黃廉貞星", element: "土", type: "凶", color: "bg-red-500" },
	east: { star: "九紫右弼星", element: "火", type: "吉", color: "bg-green-500" },
	southEast: { star: "一白貪狼星", element: "水", type: "吉", color: "bg-green-500" },
	south: { star: "二黑巨門星", element: "土", type: "凶", color: "bg-red-500" },
	southWest: { star: "八白左輔星", element: "土", type: "吉", color: "bg-green-500" },
	west: { star: "七赤破軍星", element: "金", type: "凶", color: "bg-red-500" },
	northWest: { star: "三碧祿存星", element: "木", type: "凶", color: "bg-red-500" },
	north: { star: "四綠文曲星", element: "木", type: "吉", color: "bg-green-500" },
	center: { star: "六白武曲星", element: "金", type: "吉", color: "bg-green-500" },
};

export const FLYING_STARS_2026 = {
	northEast: { star: "六白武曲星", element: "金", type: "吉", color: "bg-green-500" },
	east: { star: "一白貪狼星", element: "水", type: "吉", color: "bg-green-500" },
	southEast: { star: "二黑巨門星", element: "土", type: "凶", color: "bg-red-500" },
	south: { star: "三碧祿存星", element: "木", type: "凶", color: "bg-red-500" },
	southWest: { star: "九紫右弼星", element: "火", type: "吉", color: "bg-green-500" },
	west: { star: "八白左輔星", element: "土", type: "吉", color: "bg-green-500" },
	northWest: { star: "四綠文曲星", element: "木", type: "吉", color: "bg-green-500" },
	north: { star: "五黃廉貞星", element: "土", type: "凶", color: "bg-red-500" },
	center: { star: "七赤破軍星", element: "金", type: "凶", color: "bg-red-500" },
};

const FLYING_STARS_BY_YEAR = {
	2025: FLYING_STARS_2025,
	2026: FLYING_STARS_2026,
};

export function getFlyingStarsByYear(year) {
	const targetYear = Number(year);
	return FLYING_STARS_BY_YEAR[targetYear] || FLYING_STARS_2026;
}

export const BAZHAI_NAME_BY_GROUP = {
	東四命: {
		east: "生氣",
		southEast: "延年",
		north: "天醫",
		south: "伏位",
		west: "五鬼",
		northEast: "禍害",
		southWest: "六煞",
		northWest: "絕命",
		center: "中宮",
	},
	西四命: {
		northEast: "生氣",
		west: "延年",
		northWest: "天醫",
		southWest: "伏位",
		east: "五鬼",
		southEast: "禍害",
		south: "六煞",
		north: "絕命",
		center: "中宮",
	},
};

export const BAZHAI_LUCKY_NAMES = new Set(["生氣", "延年", "天醫", "伏位", "中宮"]);

export function getBazhaiNameByGroup(group, direction) {
	const groupMap = BAZHAI_NAME_BY_GROUP[group] || BAZHAI_NAME_BY_GROUP["西四命"];
	return groupMap[direction] || "未知";
}

export function getBazhaiFortuneByGroup(group, direction) {
	const name = getBazhaiNameByGroup(group, direction);
	if (name === "中宮") return "中性";
	return BAZHAI_LUCKY_NAMES.has(name) ? "大吉" : "大凶";
}

