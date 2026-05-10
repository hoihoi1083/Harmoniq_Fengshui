import os
from PIL import Image, ImageDraw, ImageFont

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/marketing-harmoniq/灰月光石_tc"
OUT_DIR_SC = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/marketing-harmoniq/灰月光石_sc"

os.makedirs(OUT_DIR_TC, exist_ok=True)
os.makedirs(OUT_DIR_SC, exist_ok=True)

# Fonts
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Songti.ttc", 80)
    font_sub = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 40)
    font_front_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Songti.ttc", 140)
    font_front_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Songti.ttc", 60)
except Exception as e:
    print("Font error:", e)
    # Fallback
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_front_title = ImageFont.load_default()
    font_front_sub = ImageFont.load_default()

# Texts
texts = {
    "tc": {
        "title": "灰月光石",
        "sub": "靜謐之美 · 守護心靈",
        "front_title": "灰月光石",
        "front_sub": "柔和藍光，喚醒內在的平靜與直覺",
        "report_title": "灰月光石 · 專屬報告",
        "report_sub": "為您量身定制的能量守護"
    },
    "sc": {
        "title": "灰月光石",
        "sub": "静谧之美 · 守护心灵",
        "front_title": "灰月光石",
        "front_sub": "柔和蓝光，唤醒内在的平静与直觉",
        "report_title": "灰月光石 · 专属报告",
        "report_sub": "为您量身定制的能量守护"
    }
}

def add_logo(img):
    try:
        logo = Image.open(LOGO_PATH).convert("RGBA")
        # Knock out black
        px = logo.load()
        w, h = logo.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if r < 28 and g < 28 and b < 28:
                    px[x, y] = (0, 0, 0, 0)
        
        # Resize logo
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

def process_image(img_path, out_name, lang, is_front=False, is_report=False):
    try:
        img = Image.open(img_path).convert("RGBA")
        
        # Resize to standard 1536x1024 if needed, or just fit
        target_size = (1536, 1024)
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        img = add_logo(img)
        
        draw = ImageDraw.Draw(img)
        
        if is_front:
            title = texts[lang]["front_title"]
            sub = texts[lang]["front_sub"]
            # Draw text in center
            tw = draw.textlength(title, font=font_front_title)
            sw = draw.textlength(sub, font=font_front_sub)
            
            draw.text(((img.width - tw) / 2, img.height / 2 - 100), title, font=font_front_title, fill=(240, 240, 240, 255))
            draw.text(((img.width - sw) / 2, img.height / 2 + 80), sub, font=font_front_sub, fill=(220, 220, 220, 255))
        elif is_report:
            title = texts[lang]["report_title"]
            sub = texts[lang]["report_sub"]
            draw.text((100, 100), title, font=font_title, fill=(255, 255, 255, 255))
            draw.text((100, 200), sub, font=font_sub, fill=(230, 230, 230, 255))
        else:
            title = texts[lang]["title"]
            sub = texts[lang]["sub"]
            draw.text((100, 100), title, font=font_title, fill=(255, 255, 255, 255))
            draw.text((100, 200), sub, font=font_sub, fill=(230, 230, 230, 255))
            
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, out_name)
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved {out_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

# 1. Front Cover
front_bg = os.path.join(ASSETS_DIR, "front_cover_bg.png")
process_image(front_bg, "00_front_cover.png", "tc", is_front=True)
process_image(front_bg, "00_front_cover.png", "sc", is_front=True)

# 2. Marketing Images (Girl Model)
marketing_1 = os.path.join(ASSETS_DIR, "marketing_girl_1.png")
marketing_2 = os.path.join(ASSETS_DIR, "marketing_girl_2.png")
process_image(marketing_1, "01_marketing_lifestyle.png", "tc")
process_image(marketing_1, "01_marketing_lifestyle.png", "sc")
process_image(marketing_2, "02_marketing_elegant.png", "tc")
process_image(marketing_2, "02_marketing_elegant.png", "sc")

# 3. Report Images (Attached Product Images)
attached_images = [
    "_____2026-05-07___3.06.11-92e053c5-a549-4361-a7b3-5b3c7198909a.png",
    "_____2026-05-07___3.06.21-cdecf044-bcb1-4f3a-8658-2ae09031074b.png",
    "_____2026-05-07___3.06.29-edceae0c-81ce-42bd-a82b-cdbec7610c63.png",
    "_____2026-05-07___3.06.15-503f1c34-e289-40cb-944e-c35e2ddca90b.png",
    "_____2026-05-07___3.06.25-d1310ab3-b61c-4d67-8da8-c956775dbee3.png"
]

for i, img_name in enumerate(attached_images):
    img_path = os.path.join(ASSETS_DIR, img_name)
    out_name = f"03_report_product_{i+1}.png"
    process_image(img_path, out_name, "tc", is_report=True)
    process_image(img_path, out_name, "sc", is_report=True)

print("Done generating all images.")
