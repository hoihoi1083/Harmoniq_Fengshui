import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_tc"
OUT_DIR_SC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_sc"

try:
    font_title = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 80, index=0)
    font_sub = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 40, index=0)
    font_front_title = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 140, index=0)
    font_front_sub = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 60, index=0)
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
    draw.text((x+3, y+3), text, font=font, fill=shadow_color)
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
        
        draw_text_with_shadow(draw, ((img.width - tw) / 2, img.height / 2 - 100), title, font_front_title, (240, 240, 240, 255))
        draw_text_with_shadow(draw, ((img.width - sw) / 2, img.height / 2 + 80), sub, font_front_sub, (220, 220, 220, 255))
        
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
        draw_text_with_shadow(draw, (100, 100), title, font_title, (255, 255, 255, 255))
        draw_text_with_shadow(draw, (100, 200), sub, font_sub, (230, 230, 230, 255))
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, f"{i+1:02d}_marketing_social.png")
        img.save(out_path, format="PNG", optimize=True)

print("Done updating all images with elegant serif font.")
