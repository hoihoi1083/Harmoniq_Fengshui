from PIL import ImageFont
font1 = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 80)
print("TC bbox:", font1.getbbox("灰月光石 · 專屬報告"))
print("SC bbox:", font1.getbbox("灰月光石 · 专属报告"))

font2 = ImageFont.truetype("/System/Library/Fonts/Supplemental/Songti.ttc", 80)
print("Songti TC bbox:", font2.getbbox("灰月光石 · 專屬報告"))
print("Songti SC bbox:", font2.getbbox("灰月光石 · 专属报告"))
