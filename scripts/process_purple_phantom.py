import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat, ImageFilter

# --- Configuration ---
TARGET_WIDTH = 1536
TARGET_HEIGHT = 1024
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_BASE_DIR = "/Users/michaelng/Desktop/marketing/紫幽灵手链_ad_material_20260507"

# Fonts
FONT_TC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
FONT_SC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"

# Logo positioning
LOGO_WIDTH_RATIO = 0.06
MARGIN_X_RATIO = 0.05
MARGIN_Y_RATIO = 0.05

# Report Images
REPORT_1 = os.path.join(ASSETS_DIR, "_____2026-05-05___12.18.13-416a2147-70b2-4afd-bb78-c6ac416d5eb6.png")
REPORT_2 = os.path.join(ASSETS_DIR, "_____2026-05-05___12.17.17-11cbd820-671f-470f-9bbd-df72d8e7b725.png")

# --- Marketing Texts ---
marketing_texts_tc = {
    "purple_cover.png": ("紫幽靈手鏈", "招貴人·旺事業"),
    "_____2026-05-07___6.24.46-5798ac45-a117-4646-a54a-ecffe30124c0.png": ("紫氣東來", "高雅氣質"),
    "_____2026-05-07___6.24.38-ee96ac39-eaf5-425b-8aab-399598e8112b.png": ("晶瑩剔透", "質感非凡"),
    "_____2026-05-07___6.24.33-052bbe46-7be1-464c-99a3-f85d3cb347d6.png": ("平靜心靈", "提升直覺"),
    "_____2026-05-07___6.24.50-d207d5b9-df0d-468e-98cb-e7cb34c7e346.png": ("招引貴人", "事業順遂"),
    "_____2026-05-07___6.24.43-f183cef8-0fa9-4da1-b46e-dac615636052.png": ("內含異象", "獨一無二"),
    "_____2026-05-07___6.25.07-524058ce-8618-48d9-8ffd-d047147b9547.png": ("日常百搭", "點亮穿搭"),
    "_____2026-05-07___6.25.02-35dfc046-69e6-4af7-8eae-ca150bae8648.png": ("溫潤如水", "貼身陪伴"),
    "_____2026-05-07___6.25.00-53ae53b0-b6df-4278-a7bd-7ffbc3e9bac1.png": ("職場魅力", "自信優雅"),
    "_____2026-05-07___6.25.05-93be22a3-c750-4b33-98d4-f30badf3a57b.png": ("陽光折射", "迷人光澤"),
    "purple_silk.png": ("絲滑觸感", "完美禮物"),
    "purple_tea.png": ("靜心冥想", "溫柔守護"),
    "purple_box.png": ("傳遞心意", "珍貴典藏"),
}

marketing_texts_sc = {
    "purple_cover.png": ("紫幽灵手链", "招贵人·旺事业"),
    "_____2026-05-07___6.24.46-5798ac45-a117-4646-a54a-ecffe30124c0.png": ("紫气东来", "高雅气质"),
    "_____2026-05-07___6.24.38-ee96ac39-eaf5-425b-8aab-399598e8112b.png": ("晶莹剔透", "质感非凡"),
    "_____2026-05-07___6.24.33-052bbe46-7be1-464c-99a3-f85d3cb347d6.png": ("平静心灵", "提升直觉"),
    "_____2026-05-07___6.24.50-d207d5b9-df0d-468e-98cb-e7cb34c7e346.png": ("招引贵人", "事业顺遂"),
    "_____2026-05-07___6.24.43-f183cef8-0fa9-4da1-b46e-dac615636052.png": ("内含异象", "独一无二"),
    "_____2026-05-07___6.25.07-524058ce-8618-48d9-8ffd-d047147b9547.png": ("日常百搭", "点亮穿搭"),
    "_____2026-05-07___6.25.02-35dfc046-69e6-4af7-8eae-ca150bae8648.png": ("温润如水", "贴身陪伴"),
    "_____2026-05-07___6.25.00-53ae53b0-b6df-4278-a7bd-7ffbc3e9bac1.png": ("职场魅力", "自信优雅"),
    "_____2026-05-07___6.25.05-93be22a3-c750-4b33-98d4-f30badf3a57b.png": ("阳光折射", "迷人光泽"),
    "purple_silk.png": ("丝滑触感", "完美礼物"),
    "purple_tea.png": ("静心冥想", "温柔守护"),
    "purple_box.png": ("传递心意", "珍贵典藏"),
}

# --- Helper Functions ---
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

def draw_text_with_shadow(draw, position, text, font, fill, shadow_color=(0, 0, 0, 90)):
    x, y = position
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=fill)

def add_border_and_shadow(img, border_size=4, shadow_size=15):
    bordered = ImageOps.expand(img, border=border_size, fill='white')
    shadow = Image.new('RGBA', (bordered.width + shadow_size*2, bordered.height + shadow_size*2), (0,0,0,0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rectangle([shadow_size, shadow_size, bordered.width+shadow_size, bordered.height+shadow_size], fill=(0,0,0,80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_size/2))
    shadow.paste(bordered, (shadow_size, shadow_size))
    return shadow

def process_image(img_filename, out_filename, text_tc, text_sc, is_front=False):
    img_path = os.path.join(ASSETS_DIR, img_filename)
    if not os.path.exists(img_path):
        print(f"Skipping {img_filename} - not found.")
        return

    # 1. Load and Resize
    try:
        img = Image.open(img_path).convert("RGB")
        img = ImageOps.fit(img, (TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    except Exception as e:
        print(f"Error loading {img_filename}: {e}")
        return

    # 2. Add Logo
    try:
        logo = Image.open(LOGO_PATH)
        logo = knock_out_black_for_alpha(logo)
        logo_w = int(TARGET_WIDTH * LOGO_WIDTH_RATIO)
        aspect = logo.height / logo.width
        logo_h = int(logo_w * aspect)
        logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        
        margin_x = int(TARGET_WIDTH * MARGIN_X_RATIO)
        margin_y = int(TARGET_HEIGHT * MARGIN_Y_RATIO)
        pos_x = TARGET_WIDTH - logo_w - margin_x
        pos_y = TARGET_HEIGHT - logo_h - margin_y
        img.paste(logo, (pos_x, pos_y), logo)
    except Exception as e:
        print(f"Error applying logo: {e}")

    # 3. Smart Background Analysis for Text Placement
    gray = img.convert("L")
    w, h = img.size
    left_box = (0, 0, w//3, h)
    right_box = (w*2//3, 0, w, h)
    
    left_stat = ImageStat.Stat(gray.crop(left_box))
    right_stat = ImageStat.Stat(gray.crop(right_box))
    
    place_left = left_stat.stddev[0] <= right_stat.stddev[0] + 10 # Bias to left
    brightness = left_stat.mean[0] if place_left else right_stat.mean[0]
    is_light_bg = brightness > 130

    # 4. Add Gradient Overlay
    overlay = Image.new('RGBA', img.size, (0,0,0,0))
    draw_overlay = ImageDraw.Draw(overlay)
    
    if is_front:
        # Center gradient for cover
        for y in range(h):
            alpha = int(180 * (1 - abs(y - h/2)/(h/2))) if not is_light_bg else int(120 * (1 - abs(y - h/2)/(h/2)))
            color = (0,0,0, alpha) if not is_light_bg else (255,255,255, alpha)
            draw_overlay.line([(0, y), (w, y)], fill=color)
    else:
        # Side gradient
        gradient_width = w // 2
        for x in range(gradient_width):
            alpha = int(200 * (1 - x/gradient_width)) if not is_light_bg else int(150 * (1 - x/gradient_width))
            color = (0,0,0, alpha) if not is_light_bg else (255,255,255, alpha)
            
            draw_x = x if place_left else w - 1 - x
            draw_overlay.line([(draw_x, 0), (draw_x, h)], fill=color)
            
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    # 5. Add Text (TC and SC)
    for lang, texts in [("TC", text_tc), ("SC", text_sc)]:
        img_copy = img.copy()
        draw = ImageDraw.Draw(img_copy)
        
        font_path = FONT_TC_PATH if lang == "TC" else FONT_SC_PATH
        try:
            font_title = ImageFont.truetype(font_path, 100 if is_front else 85)
            font_sub = ImageFont.truetype(font_path, 55 if is_front else 45)
        except:
            print(f"Error loading font {font_path}")
            continue

        title, subtitle = texts
        
        text_fill = (255, 235, 205) if not is_light_bg else (40, 40, 40) # Pale gold or dark charcoal
        shadow_fill = (0, 0, 0, 90) if not is_light_bg else (255, 255, 255, 150)

        if is_front:
            # Horizontal Centered
            title_bbox = draw.textbbox((0, 0), title, font=font_title)
            sub_bbox = draw.textbbox((0, 0), subtitle, font=font_sub)
            
            title_x = (w - (title_bbox[2] - title_bbox[0])) // 2
            title_y = h // 2 - 100
            
            sub_x = (w - (sub_bbox[2] - sub_bbox[0])) // 2
            sub_y = title_y + 160
            
            draw_text_with_shadow(draw, (title_x, title_y), title, font_title, text_fill, shadow_fill)
            draw_text_with_shadow(draw, (sub_x, sub_y), subtitle, font_sub, text_fill, shadow_fill)
        else:
            # Vertical
            start_x = 180 if place_left else w - 280
            start_y = 150
            
            # Draw Title Vertically
            curr_y = start_y
            for char in title:
                bbox = draw.textbbox((0, 0), char, font=font_title)
                char_w = bbox[2] - bbox[0]
                char_x = start_x - char_w // 2
                draw_text_with_shadow(draw, (char_x, curr_y), char, font_title, text_fill, shadow_fill)
                curr_y += 95
                
            # Draw Subtitle Vertically
            start_x_sub = start_x - 90 if place_left else start_x - 90
            curr_y = start_y + 100
            for char in subtitle:
                bbox = draw.textbbox((0, 0), char, font=font_sub)
                char_w = bbox[2] - bbox[0]
                char_x = start_x_sub - char_w // 2
                draw_text_with_shadow(draw, (char_x, curr_y), char, font_sub, text_fill, shadow_fill)
                curr_y += 55

        # Save
        out_dir = os.path.join(OUTPUT_BASE_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, out_filename)
        img_copy.save(out_path, "PNG")
        print(f"Saved {out_path}")

def process_promo():
    print("Generating gifted report promo image...")
    
    # 1. Background
    bg_path = os.path.join(ASSETS_DIR, "purple_silk.png")
    bg = Image.open(bg_path).convert("RGB")
    bg = ImageOps.fit(bg, (TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    # Darken and blur background slightly to make reports pop
    bg = bg.filter(ImageFilter.GaussianBlur(4))
    overlay = Image.new('RGBA', bg.size, (0,0,0, 140))
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
    logo_w = int(TARGET_WIDTH * LOGO_WIDTH_RATIO) # Small watermark
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
            draw_text_with_shadow(draw, (150, y_offset), text, font, (255, 235, 205), (0,0,0,120))
            y_offset += size + 40

        out_dir = os.path.join(OUTPUT_BASE_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "13_purple_phantom_report_promo.png")
        img_copy.convert("RGB").save(out_path, "PNG")
        print(f"Saved {out_path}")

def main():
    print("Processing Purple Phantom Crystal images...")
    
    # Process Cover
    process_image("purple_cover.png", "00_purple_phantom_cover.png", 
                  marketing_texts_tc["purple_cover.png"], 
                  marketing_texts_sc["purple_cover.png"], 
                  is_front=True)
                  
    # Process User Images + AI Lifestyle images
    images_to_process = [
        "_____2026-05-07___6.24.46-5798ac45-a117-4646-a54a-ecffe30124c0.png",
        "_____2026-05-07___6.24.38-ee96ac39-eaf5-425b-8aab-399598e8112b.png",
        "_____2026-05-07___6.24.33-052bbe46-7be1-464c-99a3-f85d3cb347d6.png",
        "_____2026-05-07___6.24.50-d207d5b9-df0d-468e-98cb-e7cb34c7e346.png",
        "_____2026-05-07___6.24.43-f183cef8-0fa9-4da1-b46e-dac615636052.png",
        "_____2026-05-07___6.25.07-524058ce-8618-48d9-8ffd-d047147b9547.png",
        "_____2026-05-07___6.25.02-35dfc046-69e6-4af7-8eae-ca150bae8648.png",
        "_____2026-05-07___6.25.00-53ae53b0-b6df-4278-a7bd-7ffbc3e9bac1.png",
        "_____2026-05-07___6.25.05-93be22a3-c750-4b33-98d4-f30badf3a57b.png",
        "purple_silk.png",
        "purple_tea.png",
        "purple_box.png"
    ]
    
    for i, img_key in enumerate(images_to_process, 1):
        out_name = f"{i:02d}_purple_phantom.png"
        process_image(img_key, out_name, 
                      marketing_texts_tc[img_key], 
                      marketing_texts_sc[img_key], 
                      is_front=False)
                      
    # Process Promo Report
    process_promo()
                      
    print("Done!")

if __name__ == "__main__":
    main()
