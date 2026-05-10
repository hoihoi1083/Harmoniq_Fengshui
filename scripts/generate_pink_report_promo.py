import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

TARGET_WIDTH = 1536
TARGET_HEIGHT = 1024
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_BASE_DIR = "/Users/michaelng/Desktop/marketing/马达加斯加粉水晶手链_ad_material_20260507"

FONT_TC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
FONT_SC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"

REPORT_1 = os.path.join(ASSETS_DIR, "_____2026-05-05___12.18.13-416a2147-70b2-4afd-bb78-c6ac416d5eb6.png")
REPORT_2 = os.path.join(ASSETS_DIR, "_____2026-05-05___12.17.17-11cbd820-671f-470f-9bbd-df72d8e7b725.png")
BG_IMAGE = os.path.join(ASSETS_DIR, "pink_02.png") # Silk background

def knock_out_black_for_alpha(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r < 28 and g < 28 and b < 28:
                px[x, y] = (0, 0, 0, 0)
    return im

def draw_text_with_shadow(draw, position, text, font, fill, shadow_color=(0, 0, 0, 100)):
    x, y = position
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=fill)

def add_border_and_shadow(img, border_size=4, shadow_size=15):
    # Add white border
    bordered = ImageOps.expand(img, border=border_size, fill='white')
    
    # Create shadow background
    shadow = Image.new('RGBA', (bordered.width + shadow_size*2, bordered.height + shadow_size*2), (0,0,0,0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rectangle([shadow_size, shadow_size, bordered.width+shadow_size, bordered.height+shadow_size], fill=(0,0,0,80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_size/2))
    
    # Paste bordered image onto shadow
    shadow.paste(bordered, (shadow_size, shadow_size))
    return shadow

def process_promo():
    print("Generating gifted report promo image...")
    
    # 1. Background
    bg = Image.open(BG_IMAGE).convert("RGB")
    bg = ImageOps.fit(bg, (TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    # Darken and blur background slightly to make reports pop
    bg = bg.filter(ImageFilter.GaussianBlur(4))
    overlay = Image.new('RGBA', bg.size, (0,0,0, 120))
    bg = Image.alpha_composite(bg.convert("RGBA"), overlay)

    # 2. Process Reports
    r1 = Image.open(REPORT_1).convert("RGB")
    r2 = Image.open(REPORT_2).convert("RGB")
    
    # Resize reports
    report_h = 650
    r1_w = int(r1.width * (report_h / r1.height))
    r2_w = int(r2.width * (report_h / r2.height))
    
    r1 = r1.resize((r1_w, report_h), Image.Resampling.LANCZOS)
    r2 = r2.resize((r2_w, report_h), Image.Resampling.LANCZOS)
    
    r1_styled = add_border_and_shadow(r1)
    r2_styled = add_border_and_shadow(r2)

    # Paste reports onto bg (overlapping slightly)
    # Right side placement
    start_x = TARGET_WIDTH - r1_styled.width - r2_styled.width + 250
    
    bg.paste(r2_styled, (start_x + r1_styled.width - 150, (TARGET_HEIGHT - r2_styled.height)//2 + 50), r2_styled)
    bg.paste(r1_styled, (start_x, (TARGET_HEIGHT - r1_styled.height)//2 - 30), r1_styled)

    # 3. Add Logo
    logo = Image.open(LOGO_PATH)
    logo = knock_out_black_for_alpha(logo)
    logo_w = int(TARGET_WIDTH * 0.06) # Small watermark
    logo_h = int(logo_w * (logo.height / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    bg.paste(logo, (TARGET_WIDTH - logo_w - 50, TARGET_HEIGHT - logo_h - 50), logo)

    # 4. Add Text for TC and SC
    texts = {
        "TC": [("結緣贈送", 110), ("專屬八字五行分析報告", 60), ("量身定制 · 助旺運勢", 45)],
        "SC": [("结缘赠送", 110), ("专属八字五行分析报告", 60), ("量身定制 · 助旺运势", 45)]
    }

    for lang, lines in texts.items():
        img_copy = bg.copy()
        draw = ImageDraw.Draw(img_copy)
        font_path = FONT_TC_PATH if lang == "TC" else FONT_SC_PATH
        
        y_offset = 350
        for text, size in lines:
            font = ImageFont.truetype(font_path, size)
            draw_text_with_shadow(draw, (150, y_offset), text, font, (255, 235, 205), (0,0,0,150))
            y_offset += size + 40

        out_dir = os.path.join(OUTPUT_BASE_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "12_madagascar_pink_report_promo.png")
        img_copy.convert("RGB").save(out_path, "PNG")
        print(f"Saved {out_path}")

if __name__ == "__main__":
    process_promo()
