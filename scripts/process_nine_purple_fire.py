import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat, ImageFilter

# --- Configuration ---
TARGET_WIDTH = 1536
TARGET_HEIGHT = 1024
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_BASE_DIR = "/Users/michaelng/Desktop/marketing/九紫离火天然紫水晶手串_ad_material_20260508"

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
    "nine_purple_fire_cover.png": ("九紫離火天然紫水晶手串", "平衡福祿·紫氣東來"),
    "nine_purple_fire_01.png": ("高貴典雅", "氣質非凡"),
    "nine_purple_fire_02.png": ("知性溫婉", "東方神韻"),
    "nine_purple_fire_03.png": ("精工細作", "璀璨奪目"),
    "nine_purple_fire_04.png": ("尊貴禮遇", "典藏佳品"),
    "nine_purple_fire_05.png": ("九紫離火", "旺運招財"),
    "nine_purple_fire_06.png": ("獨特設計", "別具一格"),
    "nine_purple_fire_07.png": ("書香雅韻", "靜心凝神"),
    "nine_purple_fire_08.png": ("溫柔觸感", "細膩呵護"),
    "nine_purple_fire_09.png": ("花開富貴", "吉祥如意"),
    "nine_purple_fire_10.png": ("靈性能量", "淨化磁場"),
    "nine_purple_fire_11.png": ("天然原礦", "吸納天地"),
    "nine_purple_fire_12.png": ("國風雅韻", "傳承經典"),
    "nine_purple_fire_13.png": ("大道至簡", "純粹之美"),
}

marketing_texts_sc = {
    "nine_purple_fire_cover.png": ("九紫离火天然紫水晶手串", "平衡福禄·紫气东来"),
    "nine_purple_fire_01.png": ("高贵典雅", "气质非凡"),
    "nine_purple_fire_02.png": ("知性温婉", "东方神韵"),
    "nine_purple_fire_03.png": ("精工细作", "璀璨夺目"),
    "nine_purple_fire_04.png": ("尊贵礼遇", "典藏佳品"),
    "nine_purple_fire_05.png": ("九紫离火", "旺运招财"),
    "nine_purple_fire_06.png": ("独特设计", "别具一格"),
    "nine_purple_fire_07.png": ("书香雅韵", "静心凝神"),
    "nine_purple_fire_08.png": ("温柔触感", "细腻呵护"),
    "nine_purple_fire_09.png": ("花开富贵", "吉祥如意"),
    "nine_purple_fire_10.png": ("灵性能量", "净化磁场"),
    "nine_purple_fire_11.png": ("天然原矿", "吸纳天地"),
    "nine_purple_fire_12.png": ("国风雅韵", "传承经典"),
    "nine_purple_fire_13.png": ("大道至简", "纯粹之美"),
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

def add_border_and_shadow(img, border_size=5, shadow_size=35, shadow_opacity=120):
    # Use a warm gold border for this style
    bordered = ImageOps.expand(img, border=border_size, fill='#d4af37') 
    shadow = Image.new('RGBA', (bordered.width + shadow_size*2, bordered.height + shadow_size*2), (0,0,0,0))
    shadow_draw = ImageDraw.Draw(shadow)
    # Deep purple/black shadow
    shadow_draw.rectangle([shadow_size, shadow_size, bordered.width+shadow_size, bordered.height+shadow_size], fill=(20,0,30,shadow_opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_size/1.5))
    shadow.paste(bordered, (shadow_size, shadow_size))
    return shadow

def process_image(img_filename, out_filename, text_tc, text_sc, is_front=False):
    img_path = os.path.join(ASSETS_DIR, img_filename)
    if not os.path.exists(img_path):
        print(f"Skipping {img_filename} - not found.")
        return

    try:
        img = Image.open(img_path).convert("RGB")
        img = ImageOps.fit(img, (TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    except Exception as e:
        print(f"Error loading {img_filename}: {e}")
        return

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

    gray = img.convert("L")
    w, h = img.size
    left_box = (0, 0, w//3, h)
    right_box = (w*2//3, 0, w, h)
    
    left_stat = ImageStat.Stat(gray.crop(left_box))
    right_stat = ImageStat.Stat(gray.crop(right_box))
    
    place_left = left_stat.stddev[0] <= right_stat.stddev[0] + 10
    brightness = left_stat.mean[0] if place_left else right_stat.mean[0]
    is_light_bg = brightness > 130

    overlay = Image.new('RGBA', img.size, (0,0,0,0))
    draw_overlay = ImageDraw.Draw(overlay)
    
    if is_front:
        for y in range(h):
            alpha = int(180 * (1 - abs(y - h/2)/(h/2))) if not is_light_bg else int(120 * (1 - abs(y - h/2)/(h/2)))
            color = (0,0,0, alpha) if not is_light_bg else (255,255,255, alpha)
            draw_overlay.line([(0, y), (w, y)], fill=color)
    else:
        gradient_width = w // 2
        for x in range(gradient_width):
            alpha = int(200 * (1 - x/gradient_width)) if not is_light_bg else int(150 * (1 - x/gradient_width))
            color = (0,0,0, alpha) if not is_light_bg else (255,255,255, alpha)
            
            draw_x = x if place_left else w - 1 - x
            draw_overlay.line([(draw_x, 0), (draw_x, h)], fill=color)
            
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

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
        
        # Warm gold text for dark backgrounds, dark purple/charcoal for light
        text_fill = (245, 225, 190) if not is_light_bg else (40, 20, 40) 
        shadow_fill = (0, 0, 0, 150) if not is_light_bg else (255, 255, 255, 180)

        if is_front:
            title_bbox = draw.textbbox((0, 0), title, font=font_title)
            sub_bbox = draw.textbbox((0, 0), subtitle, font=font_sub)
            
            title_x = (w - (title_bbox[2] - title_bbox[0])) // 2
            title_y = h // 2 - 100
            
            sub_x = (w - (sub_bbox[2] - sub_bbox[0])) // 2
            sub_y = title_y + 160
            
            draw_text_with_shadow(draw, (title_x, title_y), title, font_title, text_fill, shadow_fill)
            draw_text_with_shadow(draw, (sub_x, sub_y), subtitle, font_sub, text_fill, shadow_fill)
        else:
            start_x = 180 if place_left else w - 280
            start_y = 150
            
            curr_y = start_y
            for char in title:
                bbox = draw.textbbox((0, 0), char, font=font_title)
                char_w = bbox[2] - bbox[0]
                char_x = start_x - char_w // 2
                draw_text_with_shadow(draw, (char_x, curr_y), char, font_title, text_fill, shadow_fill)
                curr_y += 95
                
            start_x_sub = start_x - 90 if place_left else start_x - 90
            curr_y = start_y + 100
            for char in subtitle:
                bbox = draw.textbbox((0, 0), char, font=font_sub)
                char_w = bbox[2] - bbox[0]
                char_x = start_x_sub - char_w // 2
                draw_text_with_shadow(draw, (char_x, curr_y), char, font_sub, text_fill, shadow_fill)
                curr_y += 55

        out_dir = os.path.join(OUTPUT_BASE_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, out_filename)
        img_copy.save(out_path, "PNG")
        print(f"Saved {out_path}")

def process_promo():
    print("Generating gifted report promo image (Mystical Purple Lotus Style)...")
    
    # 1. Background - Mystical Purple Lotus
    bg_path = os.path.join(ASSETS_DIR, "nine_purple_fire_report_bg.png")
    bg = Image.open(bg_path).convert("RGB")
    bg = ImageOps.fit(bg, (TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    # Subtle dark overlay on the left for text readability
    overlay = Image.new('RGBA', bg.size, (0,0,0,0))
    draw_overlay = ImageDraw.Draw(overlay)
    for x in range(TARGET_WIDTH // 2):
        alpha = int(200 * (1 - x/(TARGET_WIDTH // 2)))
        draw_overlay.line([(x, 0), (x, TARGET_HEIGHT)], fill=(0,0,0, alpha))
    bg = Image.alpha_composite(bg.convert("RGBA"), overlay)

    # 2. Process Reports
    r1 = Image.open(REPORT_1).convert("RGB")
    r2 = Image.open(REPORT_2).convert("RGB")
    
    # Resize reports
    r1_h = 500
    r2_h = 500
    r1_w = int(r1.width * (r1_h / r1.height))
    r2_w = int(r2.width * (r2_h / r2.height))
    
    r1 = r1.resize((r1_w, r1_h), Image.Resampling.LANCZOS)
    r2 = r2.resize((r2_w, r2_h), Image.Resampling.LANCZOS)
    
    r1_styled = add_border_and_shadow(r1)
    r2_styled = add_border_and_shadow(r2)

    # Paste reports onto bg - "Elegant Cascade" layout
    center_x = TARGET_WIDTH // 2 + 150
    center_y = TARGET_HEIGHT // 2
    
    # Tilted slightly in opposite directions
    r1_rot = r1_styled.rotate(-5, expand=True, resample=Image.Resampling.BICUBIC)
    r2_rot = r2_styled.rotate(5, expand=True, resample=Image.Resampling.BICUBIC)

    bg.paste(r1_rot, (center_x - r1_rot.width//2 - 80, center_y - r1_rot.height//2 - 60), r1_rot)
    bg.paste(r2_rot, (center_x - r2_rot.width//2 + 80, center_y - r2_rot.height//2 + 60), r2_rot)

    # 3. Add Logo
    logo = Image.open(LOGO_PATH)
    logo = knock_out_black_for_alpha(logo)
    logo_w = int(TARGET_WIDTH * LOGO_WIDTH_RATIO)
    logo_h = int(logo_w * (logo.height / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    bg.paste(logo, (TARGET_WIDTH - logo_w - 50, TARGET_HEIGHT - logo_h - 50), logo)

    # 4. Add Text for TC and SC
    texts = {
        "TC": [("結緣贈送", 110), ("專屬八字五行分析報告", 60), ("平衡福祿 · 紫氣東來", 45)],
        "SC": [("结缘赠送", 110), ("专属八字五行分析报告", 60), ("平衡福禄 · 紫气东来", 45)]
    }

    for lang, lines in texts.items():
        img_copy = bg.copy()
        draw = ImageDraw.Draw(img_copy)
        font_path = FONT_TC_PATH if lang == "TC" else FONT_SC_PATH
        
        y_offset = 350
        for text, size in lines:
            font = ImageFont.truetype(font_path, size)
            # Warm gold text with dark shadow for mystical background
            draw_text_with_shadow(draw, (120, y_offset), text, font, (245, 225, 190), (0,0,0,220))
            y_offset += size + 40

        out_dir = os.path.join(OUTPUT_BASE_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "14_nine_purple_fire_report_promo.png")
        img_copy.convert("RGB").save(out_path, "PNG")
        print(f"Saved {out_path}")

def main():
    print("Processing Nine Purple Fire images...")
    
    process_image("nine_purple_fire_cover.png", "00_nine_purple_fire_cover.png", 
                  marketing_texts_tc["nine_purple_fire_cover.png"], 
                  marketing_texts_sc["nine_purple_fire_cover.png"], 
                  is_front=True)
                  
    images_to_process = [
        "nine_purple_fire_01.png", "nine_purple_fire_02.png", "nine_purple_fire_03.png", "nine_purple_fire_04.png",
        "nine_purple_fire_05.png", "nine_purple_fire_06.png", "nine_purple_fire_07.png", "nine_purple_fire_08.png",
        "nine_purple_fire_09.png", "nine_purple_fire_10.png", "nine_purple_fire_11.png", "nine_purple_fire_12.png",
        "nine_purple_fire_13.png"
    ]
    
    for i, img_key in enumerate(images_to_process, 1):
        out_name = f"{i:02d}_nine_purple_fire.png"
        process_image(img_key, out_name, 
                      marketing_texts_tc[img_key], 
                      marketing_texts_sc[img_key], 
                      is_front=False)
                      
    process_promo()
    print("Done!")

if __name__ == "__main__":
    main()
