// Test script to verify BaZi calculation fix for dates before Chinese New Year
const { BaziCalculator } = require('./src/lib/baziCalculator.js');

console.log('🧪 Testing BaZi calculation for 2001-01-01 12:00 (before CNY 2001)');
console.log('Expected: 年柱 = 庚辰 (not 辛巳)');
console.log('');

// Test date: 2001-01-01 12:00 (before Chinese New Year 2001 which was Jan 24)
const testDate = new Date('2001-01-01 12:00:00');

try {
    const yearPillar = BaziCalculator.getYearPillar(testDate);
    const dayPillar = BaziCalculator.getDayPillar(testDate);
    const monthPillar = BaziCalculator.getMonthPillar(testDate, 1);
    
    console.log('📊 Results:');
    console.log(`年柱: ${yearPillar.tianGan}${yearPillar.diZhi}`);
    console.log(`月柱: ${monthPillar.tianGan}${monthPillar.diZhi}`);
    console.log(`日柱: ${dayPillar.tianGan}${dayPillar.diZhi}`);
    console.log('');
    
    // Calculate hour pillar for 12:00 (午時)
    const hour = 12;
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
    const dayStemIndex = BaziCalculator.tianGan.indexOf(dayPillar.tianGan);
    const hourStemIndex = (dayStemIndex * 12 + hourBranchIndex) % 10;
    const hourPillar = BaziCalculator.tianGan[hourStemIndex] + BaziCalculator.diZhi[hourBranchIndex];
    
    console.log(`時柱: ${hourPillar}`);
    console.log('');
    
    // Verify
    if (yearPillar.tianGan === '庚' && yearPillar.diZhi === '辰') {
        console.log('✅ SUCCESS! Year pillar is correct: 庚辰');
    } else {
        console.log(`❌ FAILED! Year pillar is ${yearPillar.tianGan}${yearPillar.diZhi}, expected 庚辰`);
    }
    
    console.log('');
    console.log('Full BaZi for 2001-01-01 12:00:');
    console.log(`${yearPillar.tianGan}${yearPillar.diZhi} ${monthPillar.tianGan}${monthPillar.diZhi} ${dayPillar.tianGan}${dayPillar.diZhi} ${hourPillar}`);
    
} catch (error) {
    console.error('❌ Error:', error);
}
