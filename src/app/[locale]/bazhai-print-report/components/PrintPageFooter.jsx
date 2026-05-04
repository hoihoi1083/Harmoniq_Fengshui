export default function PrintPageFooter({ pageNum, totalPages }) {
	return (
		<div className="absolute bottom-4 right-6 text-xs text-[#6B7280]">
			Page {pageNum} / {totalPages}
		</div>
	);
}
