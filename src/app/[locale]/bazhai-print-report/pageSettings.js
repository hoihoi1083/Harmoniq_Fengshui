/**
 * Bazhai print report — page order and visibility.
 * Reorder entries to change print order; set enabled: false to omit a section.
 * The roomDetails section expands to one sheet per chunk of rooms (2 rooms per page).
 */
export const bazhaiPrintPages = [
	{ id: "cover", enabled: true },
	{ id: "mingZhaiMatch", enabled: true },
	{ id: "layoutAnalysis", enabled: true },
	{ id: "roomDetails", enabled: true },
	{ id: "overallSummary", enabled: true },
	{ id: "yearlyReminders", enabled: true },
	{ id: "conclusion", enabled: true },
];
