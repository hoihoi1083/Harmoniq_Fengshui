import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat, ImageFilter

# --- Configuration ---
TARGET_WIDTH = 1536
TARGET_HEIGHT = 1024
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_BASE_DIR = "/Users/michaelng/Desktop/marketing/天然水晶草莓晶粉水晶月光石手串_ad_material_20260508"

# Fonts
FONT_TC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
FONT_SC_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"

# Logo positioning
LOGO_WIDTH_RATIO = 0.06
MARGIN_X_RATIO = 0.05
MARGIN_Y_RATIO = 0.05

images_data = [
    {"file": "strawberry_cover.png", "tc": ("芭蕾甜酒", "招桃花 · 增添魅力"), "sc": ("芭蕾甜酒", "招桃花 · 增添魅力"), "is_front": True},
    {"file": "strawberry_model_cafe.png", "tc": ("甜美可人", "日常穿搭 · 點亮心情"), "sc": ("甜美可人", "日常穿搭 · 点亮心情"), "is_front": False},
    {"file": "strawberry_model_spring.png", "tc": ("春日浪漫", "邂逅美好 · 遇見對的人"), "sc": ("春日浪漫", "邂逅美好 · 遇见对的人"), "is_front": False},
    {"file": "strawberry_detail_macro.png", "tc": ("冰體草莓晶", "花瓣分明 · 濃郁晶瑩"), "sc": ("冰体草莓晶", "花瓣分明 · 浓郁晶莹"), "is_front": False},
    {"file": "strawberry_detail_transition.png", "tc": ("星光粉水", "柔和光澤 · 提升氣質"), "sc": ("星光粉水", "柔和光泽 · 提升气质"), "is_front": False},
    {"file": "strawberry_shell_dish.png", "tc": ("清新甜美", "少女情懷 · 活力滿滿"), "sc": ("清新甜美", "少女情怀 · 活力满满"), "is_front": False},
    {"file": "strawberry_mirror_reflection.png", "tc": ("純淨無瑕", "晶瑩剔透 · 光影流轉"), "sc": ("纯净无暇", "晶莹剔透 · 光影流转"), "is_front": False},
    {"file": "strawberry_poetry_book.png", "tc": ("文藝復古", "書香氣息 · 浪漫詩意"), "sc": ("文艺复古", "书香气息 · 浪漫诗意"), "is_front": False},
    {"file": "strawberry_pink_lace.png", "tc": ("法式優雅", "精緻蕾絲 · 夢幻氛圍"), "sc": ("法式优雅", "精致蕾丝 · 梦幻氛围"), "is_front": False},
    {"file": "strawberry_velvet_box.png", "tc": ("完美好禮", "心意之選 · 浪漫餽贈"), "sc": ("完美好礼", "心意之选 · 浪漫馈赠"), "is_front": False},
    {"file": "strawberry_magical_floating.png", "tc": ("靈性啟發", "吸引力法則 · 匯聚能量"), "sc": ("灵性启发", "吸引力法则 · 汇聚能量"), "is_front": False},
    {"file": "strawberry_crystal_geode.png", "tc": ("天然原礦", "自然之美 · 溫和磁場"), "sc": ("天然原矿", "自然之美 · 温和磁场"), "is_front": False},
    {"file": "strawberry_water_ripple.png", "tc": ("如水清透", "洗滌心靈 · 煥發光彩"), "sc": ("如水清透", "洗涤心灵 · 焕发光彩"), "is_front": False},
]

report_data = {"file": "strawberry_report_style.png", "tc": ("結緣贈送", "專屬鑑定報告"), "sc": ("结缘赠送", "专属鉴定报告"), "is_front": False}

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
    print("Processing Strawberry Quartz bracelet images...")
    
    for i, data in enumerate(images_data):
        process_image(i, data)
        
    process_image(14, report_data, is_promo=True)
    print("Done!")

if __name__ == "__main__":
    main()
