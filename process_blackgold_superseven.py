import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/黑金超七方糖水晶_ad_material_20260507/TC"
OUT_DIR_SC = "/Users/michaelng/Desktop/marketing/黑金超七方糖水晶_ad_material_20260507/SC"

os.makedirs(OUT_DIR_TC, exist_ok=True)
os.makedirs(OUT_DIR_SC, exist_ok=True)

try:
    font_path_tc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
    font_path_sc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"
except Exception as e:
    print("Font error:", e)

# 13 Images total (5 original + 7 generated + 1 cover)
images_data = [
    # Original Images
    {"file": "_____2026-05-07___5.40.29-80aa834c-e530-45c6-a260-89d125fe8a7c.png", "tc": ("頂級超七", "能量之王 · 磁場強大"), "sc": ("顶级超七", "能量之王 · 磁场强大"), "is_cover": False},
    {"file": "_____2026-05-07___5.40.17-438d06db-7cc2-4776-89e8-5d39ed8c61ca.png", "tc": ("方糖點綴", "獨特品味 · 彰顯個性"), "sc": ("方糖点缀", "独特品味 · 彰显个性"), "is_cover": False},
    {"file": "_____2026-05-07___5.40.08-a4202f1c-872d-42e2-8be1-9f09ed4faa08.png", "tc": ("招財辟邪", "護身轉運 · 帶來好運"), "sc": ("招财辟邪", "护身转运 · 带来好运"), "is_cover": False},
    {"file": "_____2026-05-07___5.40.13-641962ae-3d4b-49ad-810d-ed2368d8c115.png", "tc": ("晶體通透", "髮絲濃密 · 閃耀動人"), "sc": ("晶体通透", "发丝浓密 · 闪耀动人"), "is_cover": False},
    {"file": "_____2026-05-07___5.40.21-8fbd00c6-5499-411e-80f5-7eee08049fb0.png", "tc": ("匠心嚴選", "珍稀原礦 · 值得收藏"), "sc": ("匠心严选", "珍稀原矿 · 值得收藏"), "is_cover": False},
    # Generated Images
    {"file": "blackgold_model_1.png", "tc": ("氣質高雅", "展現非凡 · 自信從容"), "sc": ("气质高雅", "展现非凡 · 自信从容"), "is_cover": False},
    {"file": "blackgold_model_2.png", "tc": ("專屬能量", "伴您同行 · 溫暖守護"), "sc": ("专属能量", "伴您同行 · 温暖守护"), "is_cover": False},
    {"file": "blackgold_hand_wood.png", "tc": ("禪意生活", "靜心凝神 · 找回平靜"), "sc": ("禅意生活", "静心凝神 · 找回平静"), "is_cover": False},
    {"file": "blackgold_hand_silk.png", "tc": ("日常百搭", "點亮穿搭 · 閃耀每一天"), "sc": ("日常百搭", "点亮穿搭 · 闪耀每一天"), "is_cover": False},
    {"file": "blackgold_hand_tea.png", "tc": ("招財納福", "事業有成 · 順風順水"), "sc": ("招财纳福", "事业有成 · 顺风顺水"), "is_cover": False},
    {"file": "blackgold_hand_work.png", "tc": ("職場貴人", "提升氣場 · 步步高升"), "sc": ("职场贵人", "提升气场 · 步步高升"), "is_cover": False},
    {"file": "blackgold_giftbox.png", "tc": ("完美好禮", "傳遞心意 · 珍貴餽贈"), "sc": ("完美好礼", "传递心意 · 珍贵馈赠"), "is_cover": False}
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

def process_cover():
    img_path = os.path.join(ASSETS_DIR, "blackgold_cover_bg.png")
    if not os.path.exists(img_path):
        return
    
    for lang in ["tc", "sc"]:
        font_path = font_path_tc if lang == "tc" else font_path_sc
        font_title = ImageFont.truetype(font_path, 150)
        font_sub = ImageFont.truetype(font_path, 60)
        
        img = Image.open(img_path).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        img = add_logo(img)
        draw = ImageDraw.Draw(img)
        
        title = "黑金超七"
        sub = "招財聚氣 · 方糖水晶" if lang == "tc" else "招财聚气 · 方糖水晶"
        
        tw = draw.textlength(title, font=font_title)
        sw = draw.textlength(sub, font=font_sub)
        
        gold_color = (212, 175, 55, 255)
        sub_color = (230, 210, 150, 255)
        shadow_color = (0, 0, 0, 180)
        
        draw_text_with_shadow(draw, ((img.width - tw) / 2, img.height / 2 - 120), title, font_title, gold_color, shadow_color)
        draw_text_with_shadow(draw, ((img.width - sw) / 2, img.height / 2 + 80), sub, font_sub, sub_color, shadow_color)
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, "00_blackgold_cover.png")
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved {out_path}")

def process_image(idx, data):
    img_path = os.path.join(ASSETS_DIR, data["file"])
    if not os.path.exists(img_path):
        print(f"Missing {img_path}")
        return
        
    for lang in ["tc", "sc"]:
        font_path = font_path_tc if lang == "tc" else font_path_sc
        
        img = Image.open(img_path).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        
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
        out_name = f"{idx+1:02d}_blackgold_superseven.png"
        out_path = os.path.join(out_dir, out_name)
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved {out_path}")

process_cover()
for i, data in enumerate(images_data):
    process_image(i, data)

print("Done processing all images.")
