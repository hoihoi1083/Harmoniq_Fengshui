import os
from PIL import Image, ImageDraw, ImageFont

img = Image.new("RGB", (1200, 800), "white")
draw = ImageDraw.Draw(img)

fonts = [
    ("Hiragino Mincho ProN", "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 0),
    ("Songti", "/System/Library/Fonts/Supplemental/Songti.ttc", 0),
    ("ZCOOL XiaoWei", "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/ZCOOLXiaoWei-Regular.ttf", 0),
    ("LongCang", "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/LongCang-Regular.ttf", 0),
    ("MaShanZheng", "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/MaShanZheng-Regular.ttf", 0),
]

y = 50
for name, path, index in fonts:
    try:
        if path.endswith(".ttc"):
            font = ImageFont.truetype(path, 60, index=index)
        else:
            font = ImageFont.truetype(path, 60)
        draw.text((50, y), f"{name}: 灰月光石 · 靜心靈性", font=font, fill="black")
        y += 100
    except Exception as e:
        print(f"Error with {name}: {e}")

img.save("font_test.png")
