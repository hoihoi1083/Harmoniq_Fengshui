import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_tc"
OUT_DIR_SC = "/Users/michaelng/Desktop/marketing/灰月光石手串_ad_material_20260507/灰月光石_sc"

try:
    # Hiragino Mincho ProN is the most elegant, high-end Serif/Songti font on macOS
    font_title = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 90, index=0)
    font_sub = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 40, index=0)
    font_front_title = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 150, index=0)
    font_front_sub = ImageFont.truetype("/System/Library/Fonts/ヒラギノ明朝 ProN.ttc", 55, index=0)
except Exception as e:
    print("Font error:", e)

marketing_texts = {
    "tc": [
        ("灰月光石", "靜謐之美 · 守護心靈"),
        ("灰月光石", "柔和藍光 · 喚醒直覺"),
        ("灰月光石", "禪意生活 · 平靜安寧"),
        ("灰月光石", "專屬解讀 · 能量指引"),
        ("灰月光石", "絲滑觸感 · 溫潤如玉"),
        ("灰月光石", "完美好禮 · 傳遞心意"),
        ("灰月光石", "自然共鳴 · 淨化磁場"),
        ("灰月光石", "自信優雅 · 職場守護"),
        ("灰月光石", "深度冥想 · 靈性提升"),
        ("灰月光石", "極致美學 · 時尚百搭")
    ],
    "sc": [
        ("灰月光石", "静谧之美 · 守护心灵"),
        ("灰月光石", "柔和蓝光 · 唤醒直觉"),
        ("灰月光石", "禅意生活 · 平静安宁"),
        ("灰月光石", "专属解读 · 能量指引"),
        ("灰月光石", "丝滑触感 · 温润如玉"),
        ("灰月光石", "完美好礼 · 传递心意"),
        ("灰月光石", "自然共鸣 · 净化磁场"),
        ("灰月光石", "自信优雅 · 职场守护"),
        ("灰月光石", "深度冥想 · 灵性提升"),
        ("灰月光石", "极致美学 · 时尚百搭")
    ]
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
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=fill)

def process_image(img_path, out_name, texts_dict, is_front=False):
    if not os.path.exists(img_path):
        return
        
    for lang in ["tc", "sc"]:
        img = Image.open(img_path).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        
        # Analyze brightness to determine text placement and color
        gray = img.convert("L")
        w, h = img.size
        left_box = (0, 0, w//3, h)
        right_box = (w*2//3, 0, w, h)
        
        left_stat = ImageStat.Stat(gray.crop(left_box))
        right_stat = ImageStat.Stat(gray.crop(right_box))
        
        # Prefer the side with less variance (smoother background)
        place_left = left_stat.stddev[0] <= right_stat.stddev[0] + 10 # Slight bias to left
        
        # Determine text color based on brightness of chosen side
        brightness = left_stat.mean[0] if place_left else right_stat.mean[0]
        is_light_bg = brightness > 130
        
        # Create a subtle gradient overlay for text readability
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        draw_overlay = ImageDraw.Draw(overlay)
        
        if is_light_bg:
            # Light background -> Dark text, light gradient
            title_color = (40, 40, 40, 255)
            sub_color = (80, 80, 80, 255)
            shadow_color = (255, 255, 255, 180)
            grad_color = (255, 255, 255)
        else:
            # Dark background -> Light/Gold text, dark gradient
            title_color = (235, 215, 165, 255) # Elegant pale gold
            sub_color = (210, 210, 210, 255)
            shadow_color = (0, 0, 0, 180)
            grad_color = (0, 0, 0)
            
        # Draw gradient
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
        
        title, sub = texts_dict[lang]
        
        if is_front:
            tw = draw.textlength(title, font=font_front_title)
            sw = draw.textlength(sub, font=font_front_sub)
            draw_text_with_shadow(draw, ((w - tw) / 2, h / 2 - 120), title, font_front_title, title_color, shadow_color)
            draw_text_with_shadow(draw, ((w - sw) / 2, h / 2 + 80), sub, font_front_sub, sub_color, shadow_color)
        else:
            # Vertical layout
            start_x = 180 if place_left else w - 280
            
            # Draw title
            start_y = 120
            for char in title:
                draw_text_with_shadow(draw, (start_x, start_y), char, font_title, title_color, shadow_color)
                start_y += 100
                
            # Draw subtitle
            start_y = 160
            sub_x = start_x - 70
            for char in sub:
                if char == '·' or char == ' ':
                    start_y += 30
                    continue
                draw_text_with_shadow(draw, (sub_x, start_y), char, font_sub, sub_color, shadow_color)
                start_y += 45
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, out_name)
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved {out_path} (Left: {place_left}, Light BG: {is_light_bg})")

# 1. Front Cover
front_bg = os.path.join(ASSETS_DIR, "front_cover_bg.png")
process_image(front_bg, "00_front_cover.png", {"tc": ("灰月光石", "柔和藍光，喚醒內在的平靜與直覺"), "sc": ("灰月光石", "柔和蓝光，唤醒内在的平静与直觉")}, is_front=True)

# 2. Marketing Images
for i in range(10):
    img_path = os.path.join(ASSETS_DIR, f"marketing_girl_{i+1}.png")
    texts_dict = {"tc": marketing_texts["tc"][i], "sc": marketing_texts["sc"][i]}
    process_image(img_path, f"{i+1:02d}_marketing_social.png", texts_dict)

# 3. Report Images
report_images = [
    "new_report_1_dark.png", "new_report_2_wood.png", "new_report_3_silk.png", 
    "new_report_4_stone.png", "new_report_5_giftbox.png"
]
report_texts = {"tc": ("灰月光石", "靜心靈性 · 能量守護"), "sc": ("灰月光石", "静心灵性 · 能量守护")}
for i, img_name in enumerate(report_images):
    img_path = os.path.join(ASSETS_DIR, img_name)
    process_image(img_path, f"03_report_product_{i+1}.png", report_texts)

print("Done with smart text overlay.")
