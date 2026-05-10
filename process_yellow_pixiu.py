import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/招财贵人天然黄阿赛手链_ad_material_20260507/TC"
OUT_DIR_SC = "/Users/michaelng/Desktop/marketing/招财贵人天然黄阿赛手链_ad_material_20260507/SC"

os.makedirs(OUT_DIR_TC, exist_ok=True)
os.makedirs(OUT_DIR_SC, exist_ok=True)

try:
    font_path_tc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
    font_path_sc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"
except Exception as e:
    print("Font error:", e)

# 12 Images total (5 original + 7 generated)
images_data = [
    # Original Images
    {"file": "_____2026-05-07___5.21.07-d43cda65-a0da-4b60-9a7b-24841bf38987.png", "tc": ("招財貴人", "黃阿賽水晶 · 守護平安"), "sc": ("招财贵人", "黄阿赛水晶 · 守护平安"), "is_cover": True},
    {"file": "_____2026-05-07___5.21.12-ac263a3c-9e84-4de3-aa12-4595f60a518c.png", "tc": ("財運亨通", "步步高升 · 事業有成"), "sc": ("财运亨通", "步步高升 · 事业有成"), "is_cover": False},
    {"file": "_____2026-05-07___5.21.03-654e7b71-4cbe-4cc0-ac34-153002db630e.png", "tc": ("草莓晶貔貅", "招財納福 · 聚氣生財"), "sc": ("草莓晶貔貅", "招财纳福 · 聚气生财"), "is_cover": False},
    {"file": "_____2026-05-07___5.21.19-bfb8e580-6b90-41b2-a2cb-671c355b114f.png", "tc": ("晶瑩剔透", "溫潤如玉 · 氣質非凡"), "sc": ("晶莹剔透", "温润如玉 · 气质非凡"), "is_cover": False},
    {"file": "_____2026-05-07___5.20.58-394fdf33-cab2-47f6-9fa1-3e15b8dd9090.png", "tc": ("匠心打磨", "嚴選原礦 · 獨一無二"), "sc": ("匠心打磨", "严选原矿 · 独一无二"), "is_cover": False},
    # Generated Images
    {"file": "yellow_pixiu_model_1.png", "tc": ("氣質優雅", "展現魅力 · 自信從容"), "sc": ("气质优雅", "展现魅力 · 自信从容"), "is_cover": False},
    {"file": "yellow_pixiu_model_2.png", "tc": ("專屬能量", "伴您同行 · 溫暖守護"), "sc": ("专属能量", "伴您同行 · 温暖守护"), "is_cover": False},
    {"file": "yellow_pixiu_hand_wood.png", "tc": ("禪意生活", "靜心凝神 · 找回平靜"), "sc": ("禅意生活", "静心凝神 · 找回平静"), "is_cover": False},
    {"file": "yellow_pixiu_hand_silk.png", "tc": ("日常百搭", "點亮穿搭 · 閃耀每一天"), "sc": ("日常百搭", "点亮穿搭 · 闪耀每一天"), "is_cover": False},
    {"file": "yellow_pixiu_hand_tea.png", "tc": ("招財辟邪", "守護平安 · 帶來好運"), "sc": ("招财辟邪", "守护平安 · 带来好运"), "is_cover": False},
    {"file": "yellow_pixiu_hand_work.png", "tc": ("職場貴人", "事業有成 · 順風順水"), "sc": ("职场贵人", "事业有成 · 顺风顺水"), "is_cover": False},
    {"file": "yellow_pixiu_giftbox.png", "tc": ("完美好禮", "傳遞心意 · 珍貴餽贈"), "sc": ("完美好礼", "传递心意 · 珍贵馈赠"), "is_cover": False}
]

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
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=fill)

def process_image(idx, data):
    img_path = os.path.join(ASSETS_DIR, data["file"])
    if not os.path.exists(img_path):
        print(f"Missing {img_path}")
        return
        
    for lang in ["tc", "sc"]:
        font_path = font_path_tc if lang == "tc" else font_path_sc
        
        img = Image.open(img_path).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        
        # Analyze brightness to determine text placement and color
        gray = img.convert("L")
        w, h = img.size
        left_box = (0, 0, w//3, h)
        right_box = (w*2//3, 0, w, h)
        
        left_stat = ImageStat.Stat(gray.crop(left_box))
        right_stat = ImageStat.Stat(gray.crop(right_box))
        
        place_left = left_stat.stddev[0] <= right_stat.stddev[0] + 10
        
        brightness = left_stat.mean[0] if place_left else right_stat.mean[0]
        is_light_bg = brightness > 130
        
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        draw_overlay = ImageDraw.Draw(overlay)
        
        if is_light_bg:
            title_color = (40, 40, 40, 255)
            sub_color = (80, 80, 80, 255)
            shadow_color = (255, 255, 255, 180)
            grad_color = (255, 255, 255)
        else:
            # Elegant pale gold for dark backgrounds
            title_color = (235, 215, 165, 255) 
            sub_color = (210, 210, 210, 255)
            shadow_color = (0, 0, 0, 180)
            grad_color = (0, 0, 0)
            
        grad_width = w // 2
        for x in range(grad_width):
            alpha = int(120 * (1 - x/grad_width))
            if place_left:
                draw_overlay.line([(x, 0), (x, h)], fill=grad_color + (alpha,))
            else:
                draw_overlay.line([(w-1-x, 0), (w-1-x, h)], fill=grad_color + (alpha,))
                
        img = Image.alpha_composite(img, overlay)
        img = add_logo(img)
        draw = ImageDraw.Draw(img)
        
        title, sub = data[lang]
        
        if data["is_cover"]:
            font_title = ImageFont.truetype(font_path, 140)
            font_sub = ImageFont.truetype(font_path, 55)
            tw = draw.textlength(title, font=font_title)
            sw = draw.textlength(sub, font=font_sub)
            draw_text_with_shadow(draw, ((w - tw) / 2, h / 2 - 120), title, font_title, title_color, shadow_color)
            draw_text_with_shadow(draw, ((w - sw) / 2, h / 2 + 80), sub, font_sub, sub_color, shadow_color)
        else:
            font_title = ImageFont.truetype(font_path, 90)
            font_sub = ImageFont.truetype(font_path, 40)
            start_x = 180 if place_left else w - 280
            
            start_y = 120
            for char in title:
                draw_text_with_shadow(draw, (start_x, start_y), char, font_title, title_color, shadow_color)
                start_y += 100
                
            start_y = 160
            sub_x = start_x - 70
            for char in sub:
                if char == '·' or char == ' ':
                    start_y += 30
                    continue
                draw_text_with_shadow(draw, (sub_x, start_y), char, font_sub, sub_color, shadow_color)
                start_y += 45
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_name = f"{idx+1:02d}_yellow_pixiu.png"
        out_path = os.path.join(out_dir, out_name)
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved {out_path}")

for i, data in enumerate(images_data):
    process_image(i, data)

print("Done processing all 12 images.")
