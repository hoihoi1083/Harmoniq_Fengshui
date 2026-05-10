from PIL import Image, ImageDraw, ImageFont
import os

img = Image.new("RGB", (1000, 300), "black")
draw = ImageDraw.Draw(img)

try:
    font1 = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 80)
    draw.text((50, 50), "灰月光石 · 專屬報告", font=font1, fill="white")
    draw.text((50, 150), "灰月光石 · 专属报告", font=font1, fill="white")
    print("STHeiti Medium drawn")
except Exception as e:
    print("STHeiti error:", e)

img.save("test_font.png")
