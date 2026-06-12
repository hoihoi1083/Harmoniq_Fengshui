import { calculateAccurateBaZi } from "@/lib/accurateBaziCalculation";
import { GROUPS, R32_SLOTS, getTeamById } from "@/data/worldCup2026";

const ELEMENT_NAMES = {
	wood: "木",
	fire: "火",
	earth: "土",
	metal: "金",
	water: "水",
	木: "木",
	火: "火",
	土: "土",
	金: "金",
	水: "水",
};

/** 五行相生：生我者為貴，同我者為旺 */
const ELEMENT_GENERATES = {
	木: "水",
	火: "木",
	土: "火",
	金: "土",
	水: "金",
};

const ELEMENT_GENERATED_BY = {
	木: "火",
	火: "土",
	土: "金",
	金: "水",
	水: "木",
};

function normalizeElement(el) {
	if (!el) return "土";
	return ELEMENT_NAMES[el] || el;
}

export function computeGroupStandings(groupId, matches) {
	const group = GROUPS[groupId];
	if (!group) return [];

	const table = {};
	for (const team of group.teams) {
		table[team.id] = {
			...team,
			played: 0,
			won: 0,
			drawn: 0,
			lost: 0,
			gf: 0,
			ga: 0,
			points: 0,
			gd: 0,
		};
	}

	const groupMatches = matches.filter(
		(m) => m.groupId === groupId && m.status === "finished"
	);

	for (const m of groupMatches) {
		const home = table[m.homeId];
		const away = table[m.awayId];
		if (!home || !away) continue;

		home.played += 1;
		away.played += 1;
		home.gf += m.homeScore;
		home.ga += m.awayScore;
		away.gf += m.awayScore;
		away.ga += m.homeScore;

		if (m.homeScore > m.awayScore) {
			home.won += 1;
			home.points += 3;
			away.lost += 1;
		} else if (m.homeScore < m.awayScore) {
			away.won += 1;
			away.points += 3;
			home.lost += 1;
		} else {
			home.drawn += 1;
			away.drawn += 1;
			home.points += 1;
			away.points += 1;
		}
	}

	return Object.values(table)
		.map((row) => ({ ...row, gd: row.gf - row.ga }))
		.sort((a, b) => {
			if (b.points !== a.points) return b.points - a.points;
			if (b.gd !== a.gd) return b.gd - a.gd;
			return b.gf - a.gf;
		});
}

export function isGroupComplete(groupId, matches) {
	const group = GROUPS[groupId];
	if (!group) return false;
	const finished = matches.filter(
		(m) => m.groupId === groupId && m.status === "finished"
	).length;
	return finished >= 6;
}

/** Returns map like { A1: team, A2: team, A3: team } once a group is complete. */
export function getGroupQualifiers(matches) {
	const qualifiers = {};

	for (const groupId of Object.keys(GROUPS)) {
		if (!isGroupComplete(groupId, matches)) continue;

		const standings = computeGroupStandings(groupId, matches);
		if (standings.length >= 2) {
			qualifiers[`${groupId}1`] = standings[0];
			qualifiers[`${groupId}2`] = standings[1];
		}
		if (standings.length >= 3) {
			qualifiers[`${groupId}3`] = standings[2];
		}
	}

	return qualifiers;
}

export function buildRoundOf32Fixtures(matches) {
	const qualifiers = getGroupQualifiers(matches);

	return R32_SLOTS.map((slot) => {
		const home = qualifiers[slot.home] || null;
		const away = qualifiers[slot.away] || null;
		const ready = Boolean(home && away);

		return {
			...slot,
			home,
			away,
			ready,
			label: `${slot.home} vs ${slot.away}`,
		};
	});
}

export function getMatchesForDate(matches, dateStr) {
	return matches
		.filter((m) => m.date === dateStr)
		.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

export function getTonightMatches(matches, referenceDate = new Date()) {
	const y = referenceDate.getFullYear();
	const m = String(referenceDate.getMonth() + 1).padStart(2, "0");
	const d = String(referenceDate.getDate()).padStart(2, "0");
	const today = `${y}-${m}-${d}`;

	let tonight = getMatchesForDate(matches, today);
	if (tonight.length > 0) return { date: today, matches: tonight };

	const upcoming = [...matches]
		.filter((m) => m.status === "scheduled" && m.date >= today)
		.sort((a, b) => `${a.date}${a.kickoff}`.localeCompare(`${b.date}${b.kickoff}`));

	if (upcoming.length === 0) return { date: null, matches: [] };

	const nextDate = upcoming[0].date;
	return { date: nextDate, matches: getMatchesForDate(matches, nextDate) };
}

function elementAffinityScore(userElement, teamElement) {
	const u = normalizeElement(userElement);
	const t = normalizeElement(teamElement);
	if (u === t) return 5;
	if (ELEMENT_GENERATES[u] === t) return 4;
	if (ELEMENT_GENERATED_BY[u] === t) return 3;
	return 1;
}

function stableHash(input) {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash << 5) - hash + input.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

function buildReason(userElement, winner, loser, bazi) {
	const u = normalizeElement(userElement);
	const w = normalizeElement(winner.element);
	const reasons = {
		same: `你的日主${u}與${winner.name}的${w}行能量同頻共振，今晚磁場偏向這一方。`,
		support: `你的${u}行得到${winner.name}的${w}行相生助力，勝算較高。`,
		lucky: `以${bazi.dayMaster}${bazi.dayBranch}日柱來看，${winner.name}今晚的節奏更合你的運勢。`,
	};
	if (u === w) return reasons.same;
	if (ELEMENT_GENERATES[u] === w) return reasons.support;
	return reasons.lucky;
}

/**
 * Playful birthday-based pick for a single match (entertainment only).
 */
export function predictMatchByBirthday(birthDateTime, match) {
	const bazi = calculateAccurateBaZi(birthDateTime);
	const userElement = normalizeElement(bazi.dayElement);
	const home = getTeamById(match.homeId);
	const away = getTeamById(match.awayId);
	if (!home || !away) return null;

	let homeScore =
		elementAffinityScore(userElement, home.element) * 10 +
		(stableHash(`${birthDateTime}-${match.id}-home`) % 7);
	let awayScore =
		elementAffinityScore(userElement, away.element) * 10 +
		(stableHash(`${birthDateTime}-${match.id}-away`) % 7);

	const winner = homeScore >= awayScore ? home : away;
	const loser = homeScore >= awayScore ? away : home;

	return {
		match,
		home,
		away,
		predictedWinner: winner,
		predictedLoser: loser,
		baziLine: `${bazi.year} · ${bazi.month} · ${bazi.day} · ${bazi.hour}`,
		dayMaster: bazi.dayMaster,
		userElement,
		reason: buildReason(userElement, winner, loser, bazi),
		confidence: Math.min(95, 55 + Math.abs(homeScore - awayScore) * 3),
	};
}

export function predictTonightByBirthday(birthDateTime, matches, referenceDate = new Date()) {
	const { date, matches: tonightMatches } = getTonightMatches(matches, referenceDate);
	if (!tonightMatches.length) return { date, predictions: [] };

	return {
		date,
		predictions: tonightMatches.map((match) =>
			predictMatchByBirthday(birthDateTime, match)
		),
	};
}
