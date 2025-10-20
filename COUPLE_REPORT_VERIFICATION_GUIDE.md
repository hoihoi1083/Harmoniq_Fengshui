# 🔍 COUPLE REPORT 八字 ACCURACY VERIFICATION GUIDE

## Test Birth Dates

- **Male**: 2002-08-03 02:02 (壬午年 丁未月 癸卯日 癸丑时)
- **Female**: 2010-03-04 00:04 (庚寅年 戊寅月 癸丑日 壬子时)

## Expected Accurate Results

**Both users should have 癸水 day masters:**

- Male Day Master: 癸水 (Day Pillar: 癸卯)
- Female Day Master: 癸水 (Day Pillar: 癸丑)

## ✅ COMPONENTS TO CHECK IN COUPLE REPORT

### 1. 盤面診斷 (ChartDiagnosisSection)

**Location**: Usually appears in the chart diagnosis section
**Expected Results**:

- Female Title: `命局：癸寅月` ✅
- Male Title: `命局：癸未月` ✅
- Content should reference 癸水 day masters, not 辛金 or other incorrect elements

### 2. Individual Analysis Components

**What to look for**:

- Any references to day masters should show 癸水
- Eight character displays should show:
    - Male: 壬午 丁未 癸卯 癸丑 (or similar accurate calculation)
    - Female: 庚寅 戊寅 癸丑 壬子 (or similar accurate calculation)

### 3. Couple Compatibility Analysis

**What to check**:

- Analysis should be based on 癸水 + 癸水 interaction
- Should NOT reference incorrect elements like 庚金, 辛金, 壬水 (unless in other pillars)
- Day master analysis should consistently use 癸

### 4. Annual Analysis / Fortune Analysis

**Expected behavior**:

- Should use accurate day masters for fortune calculations
- Any personality analysis should be based on 癸水 characteristics

## ❌ RED FLAGS TO LOOK FOR

### Previously Incorrect Results:

- Female showing 辛金 day master instead of 癸水
- Male showing 辛金 day master instead of 癸水
- Chart diagnosis showing "命局：辛辰月" or "命局：辛酉月"
- Any analysis claiming the couple has different day masters

### Generic Template Content:

- Content that seems too generic or doesn't match the birth dates
- Analysis that doesn't reference the specific 癸水 characteristics
- Titles that don't match the calculated month branches (寅月, 未月)

## 🔧 VERIFICATION STEPS

### Step 1: Load the Test URL

```
http://localhost:3000/zh-TW/couple-report?birthday=2002-08-03&birthday2=2010-03-04&gender=male&gender2=female&problem=一般情侶關係分析&birthTime1=02%3A02&birthTime2=00%3A04
```

### Step 2: Check Chart Diagnosis Section

Look for the "盤面診斷" section and verify:

- Female title shows 癸寅月 (not 辛辰月 or other incorrect combinations)
- Male title shows 癸未月 (not 辛酉月 or other incorrect combinations)
- Content discusses 癸水 characteristics accurately

### Step 3: Scan All Sections

- Check every section that mentions day masters or 八字
- Verify consistency across all components
- Look for any lingering references to incorrect day masters

### Step 4: Cross-Reference with Server Logs

- Check console logs for any 八字 calculation debug messages
- Verify that APIs are using the fixed calculations

## 🎯 SUCCESS CRITERIA

✅ **All sections consistently show 癸水 day masters for both users**  
✅ **Chart diagnosis titles use correct stems and month branches**  
✅ **No references to incorrect day masters (辛金, 壬水, etc.)**  
✅ **Analysis content matches the specific birth date characteristics**  
✅ **Consistent results across all report sections**

## 🐛 If Issues Found

If any incorrect 八字 are still appearing:

1. Check which specific component/section shows the error
2. Identify if it's using its own calculateBaZi function
3. Update that component to use the fixed BaziCalculator or calculateUnifiedElements
4. Verify the fix with another test

---

**Ready to verify!** Load the couple report and check each section against this guide. 🔍
