import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/editorial_posts_20260510"

os.makedirs(OUT_DIR, exist_ok=True)

# Elegant Fonts for Magazine Style
FONT_TITLE_PATH = os.path.join(WORKSPACE, "assets/ZCOOLXiaoWei-Regular.ttf")
FONT_SUB_PATH = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")

try:
    font_large = ImageFont.truetype(FONT_TITLE_PATH, 100)
    font_medium = ImageFont.truetype(FONT_SUB_PATH, 42)
    font_small = ImageFont.truetype(FONT_SUB_PATH, 24)
except Exception as e:
    print(f"Error loading fonts: {e}")
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()
    font_small = ImageFont.load_default()

POST_SIZE = (1080, 1080)

def draw_text_center(draw, text, y_pos, font, fill=(255, 255, 255), letter_spacing=0):
    # PIL doesn't natively support letter spacing easily, so we manually draw chars if spacing > 0
    if letter_spacing > 0:
        total_width = sum([draw.textlength(c, font=font) for c in text]) + letter_spacing * (len(text) - 1)
        current_x = (POST_SIZE[0] - total_width) / 2
        for char in text:
            # Draw shadow
            draw.text((current_x+2, y_pos+2), char, font=font, fill=(0,0,0,120))
            # Draw text
            draw.text((current_x, y_pos), char, font=font, fill=fill)
            current_x += draw.textlength(char, font=font) + letter_spacing
    else:
        try:
            w = draw.textlength(text, font=font)
        except:
            w = draw.textsize(text, font=font)[0]
        x_pos = (POST_SIZE[0] - w) / 2
        # Draw shadow
        draw.text((x_pos+3, y_pos+3), text, font=font, fill=(0,0,0,150))
        draw.text((x_pos, y_pos), text, font=font, fill=fill)

def create_editorial_post(bg_file, out_name, main_title, subtitle, eng_text, align='bottom'):
    try:
        bg_path = os.path.join(ASSETS_DIR, bg_file)
        if not os.path.exists(bg_path):
            print(f"File not found: {bg_path}")
            return

        bg = Image.open(bg_path).convert("RGBA")
        bg = ImageOps.fit(bg, POST_SIZE, Image.Resampling.LANCZOS)
        
        # 1. Add subtle dark gradient for text readability
        overlay = Image.new('RGBA', POST_SIZE, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)
        
        if align == 'bottom':
            # Gradient from bottom
            for y in range(POST_SIZE[1]-600, POST_SIZE[1]):
                alpha = int(220 * ((y - (POST_SIZE[1]-600)) / 600))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'center':
            # Gradient in center
            for y in range(POST_SIZE[1]//2 - 300, POST_SIZE[1]//2 + 300):
                # Parabolic alpha
                dist_from_center = abs(y - POST_SIZE[1]//2)
                alpha = int(180 * (1 - (dist_from_center / 300)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'top':
            for y in range(600):
                alpha = int(220 * (1 - (y / 600)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
                
        bg = Image.alpha_composite(bg, overlay)
        
        # 2. Draw Editorial Frame (Thin white border inset by 40px)
        draw = ImageDraw.Draw(bg)
        inset = 45
        draw.rectangle([inset, inset, POST_SIZE[0]-inset, POST_SIZE[1]-inset], outline=(255, 255, 255, 100), width=1)
        
        # 3. Draw Text
        if align == 'bottom':
            start_y = POST_SIZE[1] - 300
        elif align == 'center':
            start_y = POST_SIZE[1] // 2 - 100
        elif align == 'top':
            start_y = 150
            
        # Draw Eng Text (Top)
        draw_text_center(draw, eng_text, start_y, font_small, fill=(200, 200, 200, 255), letter_spacing=15)
        
        # Draw Main Title (Middle)
        draw_text_center(draw, main_title, start_y + 50, font_large, fill=(255, 255, 255, 255), letter_spacing=5)
        
        # Draw Subtitle (Bottom)
        draw_text_center(draw, subtitle, start_y + 180, font_medium, fill=(220, 200, 150, 255), letter_spacing=2)

        # 4. Save
        out_path = os.path.join(OUT_DIR, out_name)
        bg.convert("RGB").save(out_path, "JPEG", quality=95)
        print(f"Generated {out_path}")
        
    except Exception as e:
        print(f"Error processing {out_name}: {e}")

print("Generating Editorial Magazine Style Posts...")

posts = [
    ("viral_01_golden_macro.png", "post_01_editorial.jpg", "大自然的奇迹", "天然金发晶貔貅首选", "NATURAL GOLDEN RUTILATED QUARTZ", "bottom"),
    ("viral_02_golden_lifestyle.png", "post_02_editorial.jpg", "毫不费力的高级感", "提升日常穿搭质感", "EFFORTLESS LUXURY", "bottom"),
    ("viral_03_alashan_zen.png", "post_03_editorial.jpg", "东方禅意美学", "阿拉善玛瑙 × 奇楠沉香", "ORIENTAL ZEN AESTHETIC", "bottom"),
    ("viral_04_alashan_lifestyle.png", "post_04_editorial.jpg", "细节彰显品味", "成功者的底气与气场", "GENTLEMAN'S CHOICE", "bottom"),
    ("viral_05_strawberry_silk.png", "post_05_editorial.jpg", "招桃花超灵神器", "草莓晶与粉晶的浪漫相遇", "STRAWBERRY QUARTZ ROMANCE", "bottom"),
    ("viral_06_strawberry_lifestyle.png", "post_06_editorial.jpg", "治愈系浪漫能量", "感受爱与被爱", "HEALING ENERGY", "top"),
    ("viral_07_luxury_unboxing.png", "post_07_editorial.jpg", "送礼的天花板", "专属五行能量分析礼盒", "THE ULTIMATE GIFT", "bottom"),
    ("viral_08_fengshui_compass.png", "post_08_editorial.jpg", "科学定制水晶", "五行命理专属能量测算", "FENG SHUI & DESTINY", "top"),
    ("viral_09_crystal_stack.png", "post_09_editorial.jpg", "能量叠戴美学", "2026最火配搭指南", "CRYSTAL STACKING", "center"),
    ("viral_10_water_caustics.png", "post_10_editorial.jpg", "净化专属磁场", "告别水逆 迎接全新好运", "PURE ENERGY CLEANSING", "bottom"),
]

for bg, out, title, sub, eng, align in posts:
    create_editorial_post(bg, out, title, sub, eng, align)

print("Done!")
