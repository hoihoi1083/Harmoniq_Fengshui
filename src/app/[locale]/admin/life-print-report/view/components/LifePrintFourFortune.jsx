"use client";

/**
 * Pages 9–12: 四大運勢 — one full A4 page per section
 * Composes: Health, Career, Wealth, Relationship
 * Page 9: 健康運勢
 * Page 10: 事業運勢
 * Page 11: 財運運勢
 * Page 12: 感情運勢
 */
import LifePrintFortuneHealth from "./LifePrintFortuneHealth.jsx";
import LifePrintFortuneCareer from "./LifePrintFortuneCareer.jsx";
import LifePrintFortuneWealth from "./LifePrintFortuneWealth.jsx";
import LifePrintFortuneRelationship from "./LifePrintFortuneRelationship.jsx";

function getSectionData(fourFortuneData, key) {
	return fourFortuneData[key] ?? fourFortuneData[`${key}FortuneData`];
}

export default function LifePrintFourFortune({ fourFortuneData }) {
	if (!fourFortuneData || typeof fourFortuneData !== "object") return null;

	const healthData = getSectionData(fourFortuneData, "health");
	const careerData = getSectionData(fourFortuneData, "career");
	const wealthData = getSectionData(fourFortuneData, "wealth");
	const relationshipData = getSectionData(fourFortuneData, "relationship");

	return (
		<>
			<LifePrintFortuneHealth data={healthData} />
			<LifePrintFortuneCareer data={careerData} />
			<LifePrintFortuneWealth data={wealthData} />
			<LifePrintFortuneRelationship data={relationshipData} />
		</>
	);
}
