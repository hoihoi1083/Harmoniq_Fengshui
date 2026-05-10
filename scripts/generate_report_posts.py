import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
REPORT_ASSETS = "/Users/michaelng/Desktop/marketing/report_assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/report_posts_tc_20260510"

os.makedirs(OUT_DIR, exist_ok=True)

FONT_PATH = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")

try:
    font_large = ImageFont.truetype(FONT_PATH, 90)
    font_medium = ImageFont.truetype(FONT_PATH, 42)
    font_small = ImageFont.truetype(FONT_PATH, 24)
except Exception as e:
    print(f"Error loading fonts: {e}")
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()
    font_small = ImageFont.load_default()

POST_SIZE = (1080, 1080)

def add_drop_shadow(image, offset=(0, 15), shadow_blur_rad=25, shadow_color=(0, 0, 0, 100)):
    shadow = Image.new('RGBA', image.size, shadow_color)
    shadow.putalpha(image.getchannel('A'))
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_blur_rad))
    
    total_width = image.width + abs(offset[0]) + shadow_blur_rad * 2
    total_height = image.height + abs(offset[1]) + shadow_blur_rad * 2
    
    result = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
    shadow_x = shadow_blur_rad + max(0, offset[0])
    shadow_y = shadow_blur_rad + max(0, offset[1])
    result.paste(shadow, (shadow_x, shadow_y), shadow)
    
    img_x = shadow_blur_rad + max(0, -offset[0])
    img_y = shadow_blur_rad + max(0, -offset[1])
    result.paste(image, (img_x, img_y), image)
    
    return result

def draw_text_center(draw, text, y_pos, font, fill=(255, 255, 255), letter_spacing=0):
    if letter_spacing > 0:
        total_width = sum([draw.textlength(c, font=font) for c in text]) + letter_spacing * (len(text) - 1)
        current_x = (POST_SIZE[0] - total_width) / 2
        for char in text:
            draw.text((current_x+3, y_pos+3), char, font=font, fill=(0,0,0,150))
            draw.text((current_x, y_pos), char, font=font, fill=fill)
            current_x += draw.textlength(char, font=font) + letter_spacing
    else:
        try:
            w = draw.textlength(text, font=font)
        except:
            w = draw.textsize(text, font=font)[0]
        x_pos = (POST_SIZE[0] - w) / 2
        draw.text((x_pos+3, y_pos+3), text, font=font, fill=(0,0,0,180))
        draw.text((x_pos, y_pos), text, font=font, fill=fill)

def create_report_post(bg_file, report_file, out_name, main_title, subtitle, eng_text):
    try:
        bg_path = os.path.join(ASSETS_DIR, bg_file)
        bg = Image.open(bg_path).convert("RGBA")
        bg = ImageOps.fit(bg, POST_SIZE, Image.Resampling.LANCZOS)
        
        # Load and resize the report image
        report_path = os.path.join(REPORT_ASSETS, report_file)
        report_img = Image.open(report_path).convert("RGBA")
        
        # Cut white margins from report (sips outputs full page)
        # Assuming the report is mostly white background with some text.
        # We'll just resize it to fit nicely.
        target_report_width = 550
        aspect = report_img.height / report_img.width
        target_report_height = int(target_report_width * aspect)
        report_img = report_img.resize((target_report_width, target_report_height), Image.Resampling.LANCZOS)
        
        # Add a slight rotation and shadow to make it look like paper on a desk
        report_img = report_img.rotate(3, expand=True, fillcolor=(0,0,0,0), resample=Image.Resampling.BICUBIC)
        report_with_shadow = add_drop_shadow(report_img, offset=(8, 15), shadow_blur_rad=25, shadow_color=(0,0,0,140))
        
        # Paste report onto background (centered horizontally, shifted slightly up)
        paste_x = (POST_SIZE[0] - report_with_shadow.width) // 2
        paste_y = 50
        bg.paste(report_with_shadow, (paste_x, paste_y), report_with_shadow)

        # Add gradient for text
        overlay = Image.new('RGBA', POST_SIZE, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)
        for y in range(POST_SIZE[1]-450, POST_SIZE[1]):
            alpha = int(240 * ((y - (POST_SIZE[1]-450)) / 450))
            draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        bg = Image.alpha_composite(bg, overlay)
        
        # Draw frame
        draw = ImageDraw.Draw(bg)
        inset = 35
        draw.rectangle([inset, inset, POST_SIZE[0]-inset, POST_SIZE[1]-inset], outline=(255, 255, 255, 120), width=2)
        
        # Draw Text
        start_y = POST_SIZE[1] - 280
        draw_text_center(draw, eng_text, start_y, font_small, fill=(210, 210, 210, 255), letter_spacing=15)
        draw_text_center(draw, main_title, start_y + 50, font_large, fill=(255, 255, 255, 255), letter_spacing=5)
        draw_text_center(draw, subtitle, start_y + 160, font_medium, fill=(220, 200, 150, 255), letter_spacing=2)

        out_path = os.path.join(OUT_DIR, out_name)
        bg.convert("RGB").save(out_path, "JPEG", quality=95)
        print(f"Generated {out_path}")
        
    except Exception as e:
        print(f"Error processing {out_name}: {e}")

print("Generating Report Advertisement Posts...")

posts = [
    ("report_bg_wealth.png", "report_wealth.png", "post_01_wealth.jpg", "專屬財運能量鑑定", "了解你的財富密碼，不再錯失機遇", "WEALTH ANALYSIS"),
    ("report_bg_career.png", "report_career.png", "post_02_career.jpg", "深度事業流年解析", "看懂職場走勢，精準掌握上升期", "CAREER ANALYSIS"),
    ("report_bg_health.png", "report_health.png", "post_03_health.jpg", "個人健康五行指引", "調和五行磁場，守護身心平衡", "HEALTH ANALYSIS"),
    ("report_bg_love.png", "report_love.png", "post_04_love.jpg", "專屬感情流年測算", "遇見對的人，把握浪漫桃花期", "LOVE ANALYSIS"),
]

for bg, report, out, title, sub, eng in posts:
    create_report_post(bg, report, out, title, sub, eng)

print("Done!")