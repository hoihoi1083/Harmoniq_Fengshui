import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_tc"
OUT_DIR_SC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_sc"

try:
    # Use ZCOOL XiaoWei, which is a beautiful brush/calligraphy font similar to Xingkai/Weibei
    font_path = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/ZCOOLXiaoWei-Regular.ttf"
    font_title = ImageFont.truetype(font_path, 100) # Made slightly larger for calligraphy
    font_sub = ImageFont.truetype(font_path, 45)
    font_front_title = ImageFont.truetype(font_path, 160)
    font_front_sub = ImageFont.truetype(font_path, 65)
except Exception as e:
    print("Font error:", e)

marketing_texts = {
    "tc": [
        ("灰月光石", "靜謐之美 · 守護心靈"),
        ("灰月光石", "柔和藍光 · 喚醒直覺"),
        ("灰月光石", "禪意生活 · 平靜安寧"),
        ("灰月光石", "專屬解讀 · 能量指引"),
        ("灰月光石", "絲滑觸感 · 溫潤如玉"),
        ("灰月光石", "完美好禮 · 傳遞心意"),
        ("灰月光石", "自然共鳴 · 淨化磁場"),
        ("灰月光石", "自信優雅 · 職場守護"),
        ("灰月光石", "深度冥想 · 靈性提升"),
        ("灰月光石", "極致美學 · 時尚百搭")
    ],
    "sc": [
        ("灰月光石", "静谧之美 · 守护心灵"),
        ("灰月光石", "柔和蓝光 · 唤醒直觉"),
        ("灰月光石", "禅意生活 · 平静安宁"),
        ("灰月光石", "专属解读 · 能量指引"),
        ("灰月光石", "丝滑触感 · 温润如玉"),
        ("灰月光石", "完美好礼 · 传递心意"),
        ("灰月光石", "自然共鸣 · 净化磁场"),
        ("灰月光石", "自信优雅 · 职场守护"),
        ("灰月光石", "深度冥想 · 灵性提升"),
        ("灰月光石", "极致美学 · 时尚百搭")
    ]
}

def add_logo(img):
    try:
        logo = Image.open(LOGO_PATH).convert("RGBA")
        px = logo.load()
        w, h = logo.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if r < 28 and g < 28 and b < 28:
                    px[x, y] = (0, 0, 0, 0)
        
        lw = int(img.width * 0.092)
        ratio = lw / logo.width
        lh = int(logo.height * ratio)
        logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
        
        margin_x = int(img.width * 0.032)
        margin_y = int(img.height * 0.032)
        x = img.width - lw - margin_x
        y = img.height - lh - margin_y
        
        img.paste(logo, (x, y), logo)
    except Exception as e:
        print("Logo error:", e)
    return img

def draw_text_with_shadow(draw, position, text, font, fill, shadow_color=(0, 0, 0, 150)):
    x, y = position
    # Draw a slightly softer shadow for calligraphy
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    # Draw main text in an elegant gold/bronze color to match the reference style
    draw.text((x, y), text, font=font, fill=fill)

# 1. Front Cover
front_bg = os.path.join(ASSETS_DIR, "front_cover_bg.png")
if os.path.exists(front_bg):
    for lang in ["tc", "sc"]:
        img = Image.open(front_bg).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        img = add_logo(img)
        draw = ImageDraw.Draw(img)
        
        title = "灰月光石"
        sub = "柔和藍光，喚醒內在的平靜與直覺" if lang == "tc" else "柔和蓝光，唤醒内在的平静与直觉"
        
        tw = draw.textlength(title, font=font_front_title)
        sw = draw.textlength(sub, font=font_front_sub)
        
        # Using an elegant gold/bronze color #D4AF37
        gold_color = (212, 175, 55, 255)
        sub_color = (230, 210, 150, 255)
        
        draw_text_with_shadow(draw, ((img.width - tw) / 2, img.height / 2 - 120), title, font_front_title, gold_color)
        draw_text_with_shadow(draw, ((img.width - sw) / 2, img.height / 2 + 80), sub, font_front_sub, sub_color)
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, "00_front_cover.png")
        img.save(out_path, format="PNG", optimize=True)

# 2. Marketing Images
for i in range(10):
    img_path = os.path.join(ASSETS_DIR, f"marketing_girl_{i+1}.png")
    if not os.path.exists(img_path):
        continue
        
    for lang in ["tc", "sc"]:
        img = Image.open(img_path).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        img = add_logo(img)
        draw = ImageDraw.Draw(img)
        
        title, sub = marketing_texts[lang][i]
        
        gold_color = (212, 175, 55, 255)
        sub_color = (230, 210, 150, 255)
        
        # Vertical layout like the reference image
        # Draw title vertically
        start_y = 100
        x_pos = 150
        for char in title:
            draw_text_with_shadow(draw, (x_pos, start_y), char, font_title, gold_color)
            start_y += 110
            
        # Draw subtitle vertically next to it
        start_y = 150
        x_pos = 80
        for char in sub:
            if char == '·' or char == ' ':
                start_y += 30
                continue
            draw_text_with_shadow(draw, (x_pos, start_y), char, font_sub, sub_color)
            start_y += 50
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, f"{i+1:02d}_marketing_social.png")
        img.save(out_path, format="PNG", optimize=True)

# 3. Report Images
report_images = [
    "new_report_1_dark.png",
    "new_report_2_wood.png",
    "new_report_3_silk.png",
    "new_report_4_stone.png",
    "new_report_5_giftbox.png"
]

report_texts = {
    "tc": {
        "title": "灰月光石",
        "sub": "靜心靈性 · 能量守護"
    },
    "sc": {
        "title": "灰月光石",
        "sub": "静心灵性 · 能量守护"
    }
}

for i, img_name in enumerate(report_images):
    img_path = os.path.join(ASSETS_DIR, img_name)
    if not os.path.exists(img_path):
        continue
        
    for lang in ["tc", "sc"]:
        img = Image.open(img_path).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        img = add_logo(img)
        draw = ImageDraw.Draw(img)
        
        title = report_texts[lang]["title"]
        sub = report_texts[lang]["sub"]
        
        gold_color = (212, 175, 55, 255)
        sub_color = (230, 210, 150, 255)
        
        # Vertical layout like the reference image
        start_y = 100
        x_pos = 150
        for char in title:
            draw_text_with_shadow(draw, (x_pos, start_y), char, font_title, gold_color)
            start_y += 110
            
        start_y = 150
        x_pos = 80
        for char in sub:
            if char == '·' or char == ' ':
                start_y += 30
                continue
            draw_text_with_shadow(draw, (x_pos, start_y), char, font_sub, sub_color)
            start_y += 50
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, f"03_report_product_{i+1}.png")
        img.save(out_path, format="PNG", optimize=True)

print("Done updating all images with vertical calligraphy font.")
