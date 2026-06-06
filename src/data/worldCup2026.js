/** 2026 FIFA World Cup — groups, fixtures, knockout template (client-editable results). */

export const TOURNAMENT = {
	name: "2026 FIFA World Cup",
	hosts: ["美國", "加拿大", "墨西哥"],
	startDate: "2026-06-11",
	endDate: "2026-07-19",
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
			{ id: "PO_D", name: "附加賽D勝者", nameEn: "Play-off D", code: "PO_D", flag: "🏳️", element: "金" },
		],
	},
	B: {
		id: "B",
		teams: [
			{ id: "CAN", name: "加拿大", nameEn: "Canada", code: "CAN", flag: "🇨🇦", element: "木" },
			{ id: "PO_A", name: "附加賽A勝者", nameEn: "Play-off A", code: "PO_A", flag: "🏳️", element: "金" },
			{ id: "QAT", name: "卡達", nameEn: "Qatar", code: "QAT", flag: "🇶🇦", element: "火" },
			{ id: "SUI", name: "瑞士", nameEn: "Switzerland", code: "SUI", flag: "🇨🇭", element: "土" },
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
			{ id: "PO_C", name: "附加賽C勝者", nameEn: "Play-off C", code: "PO_C", flag: "🏳️", element: "金" },
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
			{ id: "PO_B", name: "附加賽B勝者", nameEn: "Play-off B", code: "PO_B", flag: "🏳️", element: "金" },
			{ id: "TUN", name: "突尼西亞", nameEn: "Tunisia", code: "TUN", flag: "🇹🇳", element: "火" },
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
			{ id: "PO_2", name: "附加賽2勝者", nameEn: "Play-off 2", code: "PO_2", flag: "🏳️", element: "土" },
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
			{ id: "PO_1", name: "附加賽1勝者", nameEn: "Play-off 1", code: "PO_1", flag: "🏳️", element: "水" },
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
	// Group A
	{ id: "A1", groupId: "A", date: "2026-06-11", kickoff: "20:00", homeId: "MEX", awayId: "RSA", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A2", groupId: "A", date: "2026-06-12", kickoff: "14:00", homeId: "KOR", awayId: "PO_D", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A3", groupId: "A", date: "2026-06-18", kickoff: "20:00", homeId: "RSA", awayId: "KOR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A4", groupId: "A", date: "2026-06-19", kickoff: "17:00", homeId: "PO_D", awayId: "MEX", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A5", groupId: "A", date: "2026-06-24", kickoff: "20:00", homeId: "MEX", awayId: "KOR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "A6", groupId: "A", date: "2026-06-24", kickoff: "20:00", homeId: "PO_D", awayId: "RSA", homeScore: null, awayScore: null, status: "scheduled" },

	// Group B
	{ id: "B1", groupId: "B", date: "2026-06-12", kickoff: "20:00", homeId: "CAN", awayId: "PO_A", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "B2", groupId: "B", date: "2026-06-13", kickoff: "14:00", homeId: "QAT", awayId: "SUI", homeScore: null, awayScore: null, status: "scheduled" },

	// Group C
	{ id: "C1", groupId: "C", date: "2026-06-13", kickoff: "20:00", homeId: "BRA", awayId: "SCO", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "C2", groupId: "C", date: "2026-06-14", kickoff: "17:00", homeId: "MAR", awayId: "HAI", homeScore: null, awayScore: null, status: "scheduled" },

	// Group D
	{ id: "D1", groupId: "D", date: "2026-06-14", kickoff: "20:00", homeId: "USA", awayId: "PAR", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "D2", groupId: "D", date: "2026-06-15", kickoff: "14:00", homeId: "AUS", awayId: "PO_C", homeScore: null, awayScore: null, status: "scheduled" },

	// Add more fixtures here as the tournament progresses (Groups E–L, etc.)
	{ id: "H1", groupId: "H", date: "2026-06-15", kickoff: "20:00", homeId: "ESP", awayId: "CPV", homeScore: null, awayScore: null, status: "scheduled" },
	{ id: "J1", groupId: "J", date: "2026-06-15", kickoff: "23:00", homeId: "ARG", awayId: "JOR", homeScore: null, awayScore: null, status: "scheduled" },
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
