import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat, ImageFilter

# --- Configuration ---
TARGET_WIDTH = 1536
TARGET_HEIGHT = 1024
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_BASE_DIR = "/Users/michaelng/Desktop/marketing/天然金发晶灰月光貔貅手链_ad_material_20260508"

# Fonts
FONT_TC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
FONT_SC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"

# Logo positioning
LOGO_WIDTH_RATIO = 0.06
MARGIN_X_RATIO = 0.05
MARGIN_Y_RATIO = 0.05

images_data = [
    {"file": "cover_front.png", "tc": ("金發晶貔貅", "招財納福 · 靈性守護"), "sc": ("金发晶貔貅", "招财纳福 · 灵性守护"), "is_front": True},
    {"file": "model_outdoor.png", "tc": ("氣質百搭", "展現魅力 · 自信優雅"), "sc": ("气质百搭", "展现魅力 · 自信优雅"), "is_front": False},
    {"file": "model_indoor.png", "tc": ("溫潤如玉", "日常穿搭 · 點亮心情"), "sc": ("温润如玉", "日常穿搭 · 点亮心情"), "is_front": False},
    {"file": "detail_rutilated.png", "tc": ("璀璨金絲", "招財進寶 · 能量匯聚"), "sc": ("璀璨金丝", "招财进宝 · 能量汇聚"), "is_front": False},
    {"file": "detail_pixiu.png", "tc": ("灰月光貔貅", "藍光流轉 · 辟邪擋煞"), "sc": ("灰月光貔貅", "蓝光流转 · 辟邪挡煞"), "is_front": False},
    {"file": "slate_mood.png", "tc": ("質感非凡", "沉穩大氣 · 彰顯品味"), "sc": ("质感非凡", "沉稳大气 · 彰显品味"), "is_front": False},
    {"file": "silk_luxury.png", "tc": ("尊貴典雅", "絲滑觸感 · 珍貴餽贈"), "sc": ("尊贵典雅", "丝滑触感 · 珍贵馈赠"), "is_front": False},
    {"file": "wood_nature.png", "tc": ("自然能量", "靜心凝神 · 找回平靜"), "sc": ("自然能量", "静心凝神 · 找回平静"), "is_front": False},
    {"file": "minimalist_props.png", "tc": ("現代美學", "簡約設計 · 時尚單品"), "sc": ("现代美学", "简约设计 · 时尚单品"), "is_front": False},
    {"file": "vintage_book.png", "tc": ("書香雅韻", "傳承經典 · 歲月靜好"), "sc": ("书香雅韵", "传承经典 · 岁月静好"), "is_front": False},
    {"file": "sunlight_caustics.png", "tc": ("光影交錯", "閃耀奪目 · 璀璨人生"), "sc": ("光影交织", "闪耀夺目 · 璀璨人生"), "is_front": False},
    {"file": "artistic_floating.png", "tc": ("靈性啟發", "神秘氛圍 · 淨化心靈"), "sc": ("灵性启发", "神秘氛围 · 净化心灵"), "is_front": False},
    {"file": "water_ripple.png", "tc": ("純淨無瑕", "如水清澈 · 溫潤身心"), "sc": ("纯净无暇", "如水清澈 · 温润身心"), "is_front": False},
    {"file": "velvet_box.png", "tc": ("典藏佳品", "完美好禮 · 傳遞心意"), "sc": ("典藏佳品", "完美好礼 · 传递心意"), "is_front": False},
]

report_data = {"file": "report_alternative.png", "tc": ("結緣贈送", "專屬鑑定報告"), "sc": ("结缘赠送", "专属鉴定报告"), "is_front": False}

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

def draw_text_with_shadow(draw, position, text, font, fill, shadow_color=(0, 0, 0, 150)):
    x, y = position
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=fill)

def process_image(idx, data, is_promo=False):
    img_path = os.path.join(ASSETS_DIR, data["file"])
    if not os.path.exists(img_path):
        print(f"Skipping {data['file']} - not found.")
        return

    try:
        img = Image.open(img_path).convert("RGB")
        img = ImageOps.fit(img, (TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    except Exception as e:
        print(f"Error loading {data['file']}: {e}")
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
    
    is_front = data.get("is_front", False)
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

    for lang in ["tc", "sc"]:
        img_copy = img.copy()
        draw = ImageDraw.Draw(img_copy)
        
        font_path = FONT_TC_PATH if lang == "tc" else FONT_SC_PATH
        try:
            font_title = ImageFont.truetype(font_path, 100 if is_front else 85)
            font_sub = ImageFont.truetype(font_path, 55 if is_front else 45)
        except:
            print(f"Error loading font {font_path}")
            continue

        title, subtitle = data[lang]
        
        text_fill = (245, 245, 250) if not is_light_bg else (40, 20, 50) 
        shadow_fill = (0, 0, 0, 180) if not is_light_bg else (255, 255, 255, 180)

        if is_front:
            try:
                tw = draw.textbbox((0, 0), title, font=font_title)[2]
                sw = draw.textbbox((0, 0), subtitle, font=font_sub)[2]
            except AttributeError:
                tw = draw.textlength(title, font=font_title)
                sw = draw.textlength(subtitle, font=font_sub)
            
            title_x = (w - tw) // 2
            title_y = h // 2 - 100
            
            sub_x = (w - sw) // 2
            sub_y = title_y + 160
            
            draw_text_with_shadow(draw, (title_x, title_y), title, font_title, text_fill, shadow_fill)
            draw_text_with_shadow(draw, (sub_x, sub_y), subtitle, font_sub, text_fill, shadow_fill)
        else:
            start_x = 180 if place_left else w - 280
            start_y = 150
            
            curr_y = start_y
            for char in title:
                try:
                    char_w = draw.textbbox((0, 0), char, font=font_title)[2]
                except AttributeError:
                    char_w = draw.textlength(char, font=font_title)
                char_x = start_x - char_w // 2
                draw_text_with_shadow(draw, (char_x, curr_y), char, font_title, text_fill, shadow_fill)
                curr_y += 95
                
            start_x_sub = start_x - 90 if place_left else start_x - 90
            curr_y = start_y + 100
            for char in subtitle:
                if char == '·' or char == ' ':
                    curr_y += 40
                    continue
                try:
                    char_w = draw.textbbox((0, 0), char, font=font_sub)[2]
                except AttributeError:
                    char_w = draw.textlength(char, font=font_sub)
                char_x = start_x_sub - char_w // 2
                draw_text_with_shadow(draw, (char_x, curr_y), char, font_sub, text_fill, shadow_fill)
                curr_y += 55

        out_dir = os.path.join(OUTPUT_BASE_DIR, lang.upper())
        os.makedirs(out_dir, exist_ok=True)
        if is_promo:
            out_name = f"14_promo.png"
        else:
            out_name = f"{idx:02d}_{data['file']}"
        out_path = os.path.join(out_dir, out_name)
        img_copy.save(out_path, "PNG", optimize=True)
        print(f"Saved {out_path}")

def main():
    print("Processing Golden Rutilated Quartz Pixiu images...")
    
    for i, data in enumerate(images_data):
        process_image(i, data)
        
    process_image(14, report_data, is_promo=True)
    print("Done!")

if __name__ == "__main__":
    main()
