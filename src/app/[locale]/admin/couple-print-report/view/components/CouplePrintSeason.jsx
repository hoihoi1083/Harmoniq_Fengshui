import Page7_Seasons from "@/app/[locale]/admin/print-report/view/components/Page7_Seasons";

/** 關鍵季節 title and theme color for couple print report */
const COUPLE_SEASON_COLOR = "#A47584";

export default function CouplePrintSeason({ data }) {
	return (
		<Page7_Seasons data={{ ...data, color: COUPLE_SEASON_COLOR }} />
	);
}

