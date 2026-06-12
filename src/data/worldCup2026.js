/** 2026 FIFA World Cup — groups, fixtures, knockout template (client-editable results). */

export const TOURNAMENT = {
	name: "2026 FIFA World Cup",
	hosts: ["美國", "加拿大", "墨西哥"],
	startDate: "2026-06-11",
	endDate: "2026-07-19",
};

/** Opening match (Mexico City local time). kickoffUtc for countdown. */
export const OPENING_MATCH = {
	date: "2026-06-11",
	kickoffLocal: "13:00",
	kickoffUtc: "2026-06-11T19:00:00.000Z",
	homeId: "MEX",
	awayId: "RSA",
	venueNote: "墨西哥城當地時間",
};

/** @typedef {{ id: string, name: string, nameEn: string, code: string, flag: string, element: string }} Team */

/** @type {Record<string, { id: string, teams: Team[] }>} */
export const GROUPS = {
	A: {
		id: "A",
		teams: [
			{ id: "MEX", name: "墨西哥", nameEn: "Mexico", code: "MEX", flag: "🇲🇽", element: "火" },
			{ id: "RSA", name: "南非", nameEn: "South Africa", code: "RSA", flag: "🇿🇦", element: "土" },
			{ id: "KOR", name: "韓國", nameEn: "Korea Republic", code: "KOR", flag: "🇰🇷", element: "水" },
			{ id: "CZE", name: "捷克", nameEn: "Czechia", code: "CZE", flag: "🇨🇿", element: "金" },
		],
	},
	B: {
		id: "B",
		teams: [
			{ id: "CAN", name: "加拿大", nameEn: "Canada", code: "CAN", flag: "🇨🇦", element: "木" },
			{ id: "SUI", name: "瑞士", nameEn: "Switzerland", code: "SUI", flag: "🇨🇭", element: "土" },
			{ id: "QAT", name: "卡達", nameEn: "Qatar", code: "QAT", flag: "🇶🇦", element: "火" },
			{ id: "BIH", name: "波赫", nameEn: "Bosnia and Herzegovina", code: "BIH", flag: "🇧🇦", element: "土" },
		],
	},
	C: {
		id: "C",
		teams: [
			{ id: "BRA", name: "巴西", nameEn: "Brazil", code: "BRA", flag: "🇧🇷", element: "火" },
			{ id: "MAR", name: "摩洛哥", nameEn: "Morocco", code: "MAR", flag: "🇲🇦", element: "土" },
			{ id: "HAI", name: "海地", nameEn: "Haiti", code: "HAI", flag: "🇭🇹", element: "水" },
			{ id: "SCO", name: "蘇格蘭", nameEn: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", element: "金" },
		],
	},
	D: {
		id: "D",
		teams: [
			{ id: "USA", name: "美國", nameEn: "USA", code: "USA", flag: "🇺🇸", element: "木" },
			{ id: "PAR", name: "巴拉圭", nameEn: "Paraguay", code: "PAR", flag: "🇵🇾", element: "土" },
			{ id: "AUS", name: "澳洲", nameEn: "Australia", code: "AUS", flag: "🇦🇺", element: "火" },
			{ id: "TUR", name: "土耳其", nameEn: "Türkiye", code: "TUR", flag: "🇹🇷", element: "火" },
		],
	},
	E: {
		id: "E",
		teams: [
			{ id: "GER", name: "德國", nameEn: "Germany", code: "GER", flag: "🇩🇪", element: "金" },
			{ id: "CUW", name: "庫拉索", nameEn: "Curaçao", code: "CUW", flag: "🇨🇼", element: "水" },
			{ id: "CIV", name: "象牙海岸", nameEn: "Côte d'Ivoire", code: "CIV", flag: "🇨🇮", element: "土" },
			{ id: "ECU", name: "厄瓜多", nameEn: "Ecuador", code: "ECU", flag: "🇪🇨", element: "木" },
		],
	},
	F: {
		id: "F",
		teams: [
			{ id: "NED", name: "荷蘭", nameEn: "Netherlands", code: "NED", flag: "🇳🇱", element: "水" },
			{ id: "JPN", name: "日本", nameEn: "Japan", code: "JPN", flag: "🇯🇵", element: "木" },
			{ id: "TUN", name: "突尼西亞", nameEn: "Tunisia", code: "TUN", flag: "🇹🇳", element: "火" },
			{ id: "SWE", name: "瑞典", nameEn: "Sweden", code: "SWE", flag: "🇸🇪", element: "水" },
		],
	},
	G: {
		id: "G",
		teams: [
			{ id: "BEL", name: "比利時", nameEn: "Belgium", code: "BEL", flag: "🇧🇪", element: "土" },
			{ id: "EGY", name: "埃及", nameEn: "Egypt", code: "EGY", flag: "🇪🇬", element: "火" },
			{ id: "IRN", name: "伊朗", nameEn: "IR Iran", code: "IRN", flag: "🇮🇷", element: "水" },
			{ id: "NZL", name: "紐西蘭", nameEn: "New Zealand", code: "NZL", flag: "🇳🇿", element: "木" },
		],
	},
	H: {
		id: "H",
		teams: [
			{ id: "ESP", name: "西班牙", nameEn: "Spain", code: "ESP", flag: "🇪🇸", element: "火" },
			{ id: "CPV", name: "維德角", nameEn: "Cabo Verde", code: "CPV", flag: "🇨🇻", element: "土" },
			{ id: "KSA", name: "沙烏地阿拉伯", nameEn: "Saudi Arabia", code: "KSA", flag: "🇸🇦", element: "金" },
			{ id: "URU", name: "烏拉圭", nameEn: "Uruguay", code: "URU", flag: "🇺🇾", element: "水" },
		],
	},
	I: {
		id: "I",
		teams: [
			{ id: "FRA", name: "法國", nameEn: "France", code: "FRA", flag: "🇫🇷", element: "金" },
			{ id: "SEN", name: "塞內加爾", nameEn: "Senegal", code: "SEN", flag: "🇸🇳", element: "木" },
			{ id: "IRQ", name: "伊拉克", nameEn: "Iraq", code: "IRQ", flag: "🇮🇶", element: "火" },
			{ id: "NOR", name: "挪威", nameEn: "Norway", code: "NOR", flag: "🇳🇴", element: "水" },
		],
	},
	J: {
		id: "J",
		teams: [
			{ id: "ARG", name: "阿根廷", nameEn: "Argentina", code: "ARG", flag: "🇦🇷", element: "木" },
			{ id: "ALG", name: "阿爾及利亞", nameEn: "Algeria", code: "ALG", flag: "🇩🇿", element: "火" },
			{ id: "AUT", name: "奧地利", nameEn: "Austria", code: "AUT", flag: "🇦🇹", element: "金" },
			{ id: "JOR", name: "約旦", nameEn: "Jordan", code: "JOR", flag: "🇯🇴", element: "土" },
		],
	},
	K: {
		id: "K",
		teams: [
			{ id: "POR", name: "葡萄牙", nameEn: "Portugal", code: "POR", flag: "🇵🇹", element: "火" },
			{ id: "COD", name: "剛果民主共和國", nameEn: "Congo DR", code: "COD", flag: "🇨🇩", element: "木" },
			{ id: "UZB", name: "烏茲別克", nameEn: "Uzbekistan", code: "UZB", flag: "🇺🇿", element: "土" },
			{ id: "COL", name: "哥倫比亞", nameEn: "Colombia", code: "COL", flag: "🇨🇴", element: "木" },
		],
	},
	L: {
		id: "L",
		teams: [
			{ id: "ENG", name: "英格蘭", nameEn: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", element: "金" },
			{ id: "CRO", name: "克羅埃西亞", nameEn: "Croatia", code: "CRO", flag: "🇭🇷", element: "水" },
			{ id: "GHA", name: "迦納", nameEn: "Ghana", code: "GHA", flag: "🇬🇭", element: "木" },
			{ id: "PAN", name: "巴拿馬", nameEn: "Panama", code: "PAN", flag: "🇵🇦", element: "火" },
		],
	},
};

/** Group difficulty tags (tab labels only). */
export const GROUP_TAGS = {
	I: { tag: "死亡之組", level: "death" },
	K: { tag: "強組", level: "tough" },
	L: { tag: "強組", level: "tough" },
	D: { tag: "均衡強組", level: "tough" },
};

export function getGroupTag(groupId) {
	return GROUP_TAGS[groupId] || null;
}

/** Round-of-32 slot template (group position → slot id). */
export const R32_SLOTS = [
	{ slot: 1, home: "A1", away: "B2" },
	{ slot: 2, home: "C1", away: "D2" },
	{ slot: 3, home: "E1", away: "F2" },
	{ slot: 4, home: "G1", away: "H2" },
	{ slot: 5, home: "I1", away: "J2" },
	{ slot: 6, home: "K1", away: "L2" },
	{ slot: 7, home: "B1", away: "A2" },
	{ slot: 8, home: "D1", away: "C2" },
	{ slot: 9, home: "F1", away: "E2" },
	{ slot: 10, home: "H1", away: "G2" },
	{ slot: 11, home: "J1", away: "I2" },
	{ slot: 12, home: "L1", away: "K2" },
	{ slot: 13, home: "A3", away: "B3" },
	{ slot: 14, home: "C3", away: "D3" },
	{ slot: 15, home: "E3", away: "F3" },
	{ slot: 16, home: "G3", away: "H3" },
];

/**
 * Initial group-stage fixtures. Update `status` / scores as the tournament progresses.
 * @type {Array<{ id: string, groupId: string, date: string, kickoff: string, homeId: string, awayId: string, homeScore: number|null, awayScore: number|null, status: 'scheduled'|'finished' }>}
 */
export const INITIAL_MATCHES = [
	{ id: "A1", groupId: "A", date: "2026-06-11", kickoff: "13:00", homeId: "MEX", awayId: "RSA", homeScore: 2, awayScore: 0, status: "finished" },
	{ id: "A2", groupId: "A", date: "2026-06-11", kickoff: "20:00", homeId: "KOR", awayId: "CZE", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "B1", groupId: "B", date: "2026-06-12", kickoff: "15:00", homeId: "CAN", awayId: "BIH", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "D1", groupId: "D", date: "2026-06-12", kickoff: "18:00", homeId: "USA", awayId: "PAR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "C1", groupId: "C", date: "2026-06-13", kickoff: "21:00", homeId: "HAI", awayId: "SCO", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "D2", groupId: "D", date: "2026-06-13", kickoff: "21:00", homeId: "AUS", awayId: "TUR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "C2", groupId: "C", date: "2026-06-13", kickoff: "18:00", homeId: "BRA", awayId: "MAR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "B2", groupId: "B", date: "2026-06-13", kickoff: "12:00", homeId: "QAT", awayId: "SUI", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "E1", groupId: "E", date: "2026-06-14", kickoff: "19:00", homeId: "CIV", awayId: "ECU", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "E2", groupId: "E", date: "2026-06-14", kickoff: "12:00", homeId: "GER", awayId: "CUW", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "F1", groupId: "F", date: "2026-06-14", kickoff: "15:00", homeId: "NED", awayId: "JPN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "F2", groupId: "F", date: "2026-06-14", kickoff: "20:00", homeId: "SWE", awayId: "TUN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "H1", groupId: "H", date: "2026-06-15", kickoff: "18:00", homeId: "KSA", awayId: "URU", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "H2", groupId: "H", date: "2026-06-15", kickoff: "12:00", homeId: "ESP", awayId: "CPV", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "G1", groupId: "G", date: "2026-06-15", kickoff: "18:00", homeId: "IRN", awayId: "NZL", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "G2", groupId: "G", date: "2026-06-15", kickoff: "12:00", homeId: "BEL", awayId: "EGY", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "I1", groupId: "I", date: "2026-06-16", kickoff: "15:00", homeId: "FRA", awayId: "SEN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "I2", groupId: "I", date: "2026-06-16", kickoff: "18:00", homeId: "IRQ", awayId: "NOR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "J1", groupId: "J", date: "2026-06-16", kickoff: "20:00", homeId: "ARG", awayId: "ALG", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "J2", groupId: "J", date: "2026-06-16", kickoff: "21:00", homeId: "AUT", awayId: "JOR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "L1", groupId: "L", date: "2026-06-17", kickoff: "19:00", homeId: "GHA", awayId: "PAN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "L2", groupId: "L", date: "2026-06-17", kickoff: "15:00", homeId: "ENG", awayId: "CRO", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "K1", groupId: "K", date: "2026-06-17", kickoff: "12:00", homeId: "POR", awayId: "COD", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "K2", groupId: "K", date: "2026-06-17", kickoff: "20:00", homeId: "UZB", awayId: "COL", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A3", groupId: "A", date: "2026-06-18", kickoff: "12:00", homeId: "CZE", awayId: "RSA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "B3", groupId: "B", date: "2026-06-18", kickoff: "12:00", homeId: "SUI", awayId: "BIH", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "B4", groupId: "B", date: "2026-06-18", kickoff: "15:00", homeId: "CAN", awayId: "QAT", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A4", groupId: "A", date: "2026-06-18", kickoff: "19:00", homeId: "MEX", awayId: "KOR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "C3", groupId: "C", date: "2026-06-19", kickoff: "21:00", homeId: "BRA", awayId: "HAI", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "C4", groupId: "C", date: "2026-06-19", kickoff: "18:00", homeId: "SCO", awayId: "MAR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "D3", groupId: "D", date: "2026-06-19", kickoff: "20:00", homeId: "TUR", awayId: "PAR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "D4", groupId: "D", date: "2026-06-19", kickoff: "12:00", homeId: "USA", awayId: "AUS", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "E3", groupId: "E", date: "2026-06-20", kickoff: "16:00", homeId: "GER", awayId: "CIV", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "E4", groupId: "E", date: "2026-06-20", kickoff: "19:00", homeId: "ECU", awayId: "CUW", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "F3", groupId: "F", date: "2026-06-20", kickoff: "12:00", homeId: "NED", awayId: "SWE", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "F4", groupId: "F", date: "2026-06-20", kickoff: "22:00", homeId: "TUN", awayId: "JPN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "H3", groupId: "H", date: "2026-06-21", kickoff: "18:00", homeId: "URU", awayId: "CPV", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "H4", groupId: "H", date: "2026-06-21", kickoff: "12:00", homeId: "ESP", awayId: "KSA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "G3", groupId: "G", date: "2026-06-21", kickoff: "12:00", homeId: "BEL", awayId: "IRN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "G4", groupId: "G", date: "2026-06-21", kickoff: "18:00", homeId: "NZL", awayId: "EGY", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "I3", groupId: "I", date: "2026-06-22", kickoff: "20:00", homeId: "NOR", awayId: "SEN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "I4", groupId: "I", date: "2026-06-22", kickoff: "17:00", homeId: "FRA", awayId: "IRQ", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "J3", groupId: "J", date: "2026-06-22", kickoff: "12:00", homeId: "ARG", awayId: "AUT", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "J4", groupId: "J", date: "2026-06-22", kickoff: "20:00", homeId: "JOR", awayId: "ALG", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "L3", groupId: "L", date: "2026-06-23", kickoff: "16:00", homeId: "ENG", awayId: "GHA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "L4", groupId: "L", date: "2026-06-23", kickoff: "19:00", homeId: "PAN", awayId: "CRO", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "K3", groupId: "K", date: "2026-06-23", kickoff: "12:00", homeId: "POR", awayId: "UZB", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "K4", groupId: "K", date: "2026-06-23", kickoff: "20:00", homeId: "COL", awayId: "COD", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "C5", groupId: "C", date: "2026-06-24", kickoff: "18:00", homeId: "SCO", awayId: "BRA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "C6", groupId: "C", date: "2026-06-24", kickoff: "18:00", homeId: "MAR", awayId: "HAI", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "B5", groupId: "B", date: "2026-06-24", kickoff: "12:00", homeId: "SUI", awayId: "CAN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "B6", groupId: "B", date: "2026-06-24", kickoff: "12:00", homeId: "BIH", awayId: "QAT", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A5", groupId: "A", date: "2026-06-24", kickoff: "19:00", homeId: "CZE", awayId: "MEX", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A6", groupId: "A", date: "2026-06-24", kickoff: "19:00", homeId: "RSA", awayId: "KOR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "E5", groupId: "E", date: "2026-06-25", kickoff: "16:00", homeId: "CUW", awayId: "CIV", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "E6", groupId: "E", date: "2026-06-25", kickoff: "16:00", homeId: "ECU", awayId: "GER", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "F5", groupId: "F", date: "2026-06-25", kickoff: "18:00", homeId: "JPN", awayId: "SWE", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "F6", groupId: "F", date: "2026-06-25", kickoff: "18:00", homeId: "TUN", awayId: "NED", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "D5", groupId: "D", date: "2026-06-25", kickoff: "19:00", homeId: "TUR", awayId: "USA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "D6", groupId: "D", date: "2026-06-25", kickoff: "19:00", homeId: "PAR", awayId: "AUS", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "I5", groupId: "I", date: "2026-06-26", kickoff: "15:00", homeId: "NOR", awayId: "FRA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "I6", groupId: "I", date: "2026-06-26", kickoff: "15:00", homeId: "SEN", awayId: "IRQ", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "G5", groupId: "G", date: "2026-06-26", kickoff: "20:00", homeId: "EGY", awayId: "IRN", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "G6", groupId: "G", date: "2026-06-26", kickoff: "20:00", homeId: "NZL", awayId: "BEL", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "H5", groupId: "H", date: "2026-06-26", kickoff: "19:00", homeId: "CPV", awayId: "KSA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "H6", groupId: "H", date: "2026-06-26", kickoff: "18:00", homeId: "URU", awayId: "ESP", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "L5", groupId: "L", date: "2026-06-27", kickoff: "17:00", homeId: "PAN", awayId: "ENG", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "L6", groupId: "L", date: "2026-06-27", kickoff: "17:00", homeId: "CRO", awayId: "GHA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "J5", groupId: "J", date: "2026-06-27", kickoff: "21:00", homeId: "ALG", awayId: "AUT", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "J6", groupId: "J", date: "2026-06-27", kickoff: "21:00", homeId: "JOR", awayId: "ARG", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "K5", groupId: "K", date: "2026-06-27", kickoff: "19:30", homeId: "COL", awayId: "POR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "K6", groupId: "K", date: "2026-06-27", kickoff: "19:30", homeId: "COD", awayId: "UZB", homeScore: null, awayScore: null, status: "scheduled" },
];

export function getTeamById(teamId) {
	for (const group of Object.values(GROUPS)) {
		const team = group.teams.find((t) => t.id === teamId);
		if (team) return team;
	}
	return null;
}

export function getAllTeams() {
	return Object.values(GROUPS).flatMap((g) => g.teams);
}
