import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat

# --- Configuration ---
TARGET_WIDTH = 1536
TARGET_HEIGHT = 1024
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_BASE_DIR = "/Users/michaelng/Desktop/marketing/马达加斯加粉水晶手链_ad_material_20260507"

# Fonts
FONT_TC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
FONT_SC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"

# Logo positioning
LOGO_WIDTH_RATIO = 0.06
MARGIN_X_RATIO = 0.05
MARGIN_Y_RATIO = 0.05

# --- Marketing Texts ---
marketing_texts_tc = {
    "pink_cover.png": ("馬達加斯加粉水晶", "招桃花·旺人緣"),
    "pink_01.png": ("溫潤如水", "柔和氣質"),
    "pink_02.png": ("招引桃花", "甜蜜邂逅"),
    "pink_03.png": ("提升人緣", "貴人相助"),
    "pink_04.png": ("治癒心靈", "愛與和平"),
    "pink_05.png": ("晶瑩剔透", "質感非凡"),
    "pink_06.png": ("日常百搭", "點亮穿搭"),
    "pink_07.png": ("靜心冥想", "溫柔守護"),
    "pink_08.png": ("完美禮物", "傳遞心意"),
    "pink_09.png": ("陽光折射", "迷人光澤"),
    "pink_10.png": ("職場魅力", "自信優雅"),
    "pink_11.png": ("絲滑觸感", "貼身陪伴"),
}

marketing_texts_sc = {
    "pink_cover.png": ("马达加斯加粉水晶", "招桃花·旺人缘"),
    "pink_01.png": ("温润如水", "柔和气质"),
    "pink_02.png": ("招引桃花", "甜蜜邂逅"),
    "pink_03.png": ("提升人缘", "贵人相助"),
    "pink_04.png": ("治愈心灵", "爱与和平"),
    "pink_05.png": ("晶莹剔透", "质感非凡"),
    "pink_06.png": ("日常百搭", "点亮穿搭"),
    "pink_07.png": ("静心冥想", "温柔守护"),
    "pink_08.png": ("完美礼物", "传递心意"),
    "pink_09.png": ("阳光折射", "迷人光泽"),
    "pink_10.png": ("职场魅力", "自信优雅"),
    "pink_11.png": ("丝滑触感", "贴身陪伴"),
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
        shadow_fill = (0, 0, 0, 180) if not is_light_bg else (255, 255, 255, 180)

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
                curr_y += 100
                
            # Draw Subtitle Vertically
            start_x_sub = start_x - 100 if place_left else start_x - 100
            curr_y = start_y + 100
            for char in subtitle:
                bbox = draw.textbbox((0, 0), char, font=font_sub)
                char_w = bbox[2] - bbox[0]
                char_x = start_x_sub - char_w // 2
                draw_text_with_shadow(draw, (char_x, curr_y), char, font_sub, text_fill, shadow_fill)
                curr_y += 60

        # Save
        out_dir = os.path.join(OUTPUT_BASE_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, out_filename)
        img_copy.save(out_path, "PNG")
        print(f"Saved {out_path}")

def main():
    print("Processing Madagascar Pink Crystal images...")
    
    # Process Cover
    process_image("pink_cover.png", "00_madagascar_pink_cover.png", 
                  marketing_texts_tc["pink_cover.png"], 
                  marketing_texts_sc["pink_cover.png"], 
                  is_front=True)
                  
    # Process Lifestyle images
    for i in range(1, 12):
        img_key = f"pink_{i:02d}.png"
        out_name = f"{i:02d}_madagascar_pink.png"
        process_image(img_key, out_name, 
                      marketing_texts_tc[img_key], 
                      marketing_texts_sc[img_key], 
                      is_front=False)
                      
    print("Done!")

if __name__ == "__main__":
    main()
