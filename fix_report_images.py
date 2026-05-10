import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_tc"
OUT_DIR_SC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_sc"

os.makedirs(OUT_DIR_TC, exist_ok=True)
os.makedirs(OUT_DIR_SC, exist_ok=True)

try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Songti.ttc", 80)
    font_sub = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 40)
except Exception as e:
    print("Font error:", e)
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()

texts = {
    "tc": {
        "title": "灰月光石 · 專屬報告",
        "sub": "為您量身定制的能量守護"
    },
    "sc": {
        "title": "灰月光石 · 专属报告",
        "sub": "为您量身定制的能量守护"
    }
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
    # Draw shadow
    draw.text((x+3, y+3), text, font=font, fill=shadow_color)
    # Draw main text
    draw.text((x, y), text, font=font, fill=fill)

images_to_process = [
    "new_report_1_dark.png",
    "new_report_2_wood.png",
    "new_report_3_silk.png",
    "new_report_4_stone.png",
    "new_report_5_giftbox.png"
]

for i, img_name in enumerate(images_to_process):
    img_path = os.path.join(ASSETS_DIR, img_name)
    if not os.path.exists(img_path):
        print(f"Skipping {img_path}, not found.")
        continue
        
    for lang in ["tc", "sc"]:
        try:
            img = Image.open(img_path).convert("RGBA")
            
            # Use ImageOps.fit to perfectly crop to 1536x1024 without stretching!
            img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
            
            img = add_logo(img)
            
            draw = ImageDraw.Draw(img)
            title = texts[lang]["title"]
            sub = texts[lang]["sub"]
            
            draw_text_with_shadow(draw, (100, 100), title, font_title, (255, 255, 255, 255))
            draw_text_with_shadow(draw, (100, 200), sub, font_sub, (230, 230, 230, 255))
            
            out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
            out_name = f"03_report_product_{i+1}.png"
            out_path = os.path.join(out_dir, out_name)
            
            img.save(out_path, format="PNG", optimize=True)
            print(f"Saved {out_path}")
        except Exception as e:
            print(f"Error processing {img_name} for {lang}: {e}")

print("Done processing report images.")
