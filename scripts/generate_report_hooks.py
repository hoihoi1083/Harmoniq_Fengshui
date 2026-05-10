import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/report_hooks_tc_20260510"

os.makedirs(OUT_DIR, exist_ok=True)

# Using NotoSerifTC for EVERYTHING
FONT_PATH = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")

try:
    font_large = ImageFont.truetype(FONT_PATH, 110)
    font_medium = ImageFont.truetype(FONT_PATH, 45)
    font_small = ImageFont.truetype(FONT_PATH, 28)
except Exception as e:
    print(f"Error loading fonts: {e}")
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()
    font_small = ImageFont.load_default()

POST_SIZE = (1080, 1080)

def draw_text_center(draw, text, y_pos, font, fill=(255, 255, 255), letter_spacing=0):
    if letter_spacing > 0:
        total_width = sum([draw.textlength(c, font=font) for c in text]) + letter_spacing * (len(text) - 1)
        current_x = (POST_SIZE[0] - total_width) / 2
        for char in text:
            draw.text((current_x+3, y_pos+3), char, font=font, fill=(0,0,0,180))
            draw.text((current_x, y_pos), char, font=font, fill=fill)
            current_x += draw.textlength(char, font=font) + letter_spacing
    else:
        try:
            w = draw.textlength(text, font=font)
        except:
            w = draw.textsize(text, font=font)[0]
        x_pos = (POST_SIZE[0] - w) / 2
        draw.text((x_pos+3, y_pos+3), text, font=font, fill=(0,0,0,200))
        draw.text((x_pos, y_pos), text, font=font, fill=fill)

def create_hook_post(bg_file, out_name, main_title, subtitle, eng_text, align='center'):
    try:
        bg_path = os.path.join(ASSETS_DIR, bg_file)
        if not os.path.exists(bg_path):
            print(f"File not found: {bg_path}")
            return

        bg = Image.open(bg_path).convert("RGBA")
        bg = ImageOps.fit(bg, POST_SIZE, Image.Resampling.LANCZOS)
        
        overlay = Image.new('RGBA', POST_SIZE, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)
        
        if align == 'bottom':
            for y in range(POST_SIZE[1]-600, POST_SIZE[1]):
                alpha = int(230 * ((y - (POST_SIZE[1]-600)) / 600))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'center':
            for y in range(POST_SIZE[1]//2 - 350, POST_SIZE[1]//2 + 350):
                dist_from_center = abs(y - POST_SIZE[1]//2)
                alpha = int(190 * (1 - (dist_from_center / 350)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'top':
            for y in range(600):
                alpha = int(230 * (1 - (y / 600)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
                
        bg = Image.alpha_composite(bg, overlay)
        draw = ImageDraw.Draw(bg)
        
        if align == 'bottom':
            start_y = POST_SIZE[1] - 300
        elif align == 'center':
            start_y = POST_SIZE[1] // 2 - 120
        elif align == 'top':
            start_y = 150
            
        # Draw Eng Text
        draw_text_center(draw, eng_text, start_y, font_small, fill=(220, 200, 150, 255), letter_spacing=10)
        
        # Draw Main Title (The Hook)
        draw_text_center(draw, main_title, start_y + 50, font_large, fill=(255, 255, 255, 255), letter_spacing=2)
        
        # Draw Subtitle (The Solution)
        draw_text_center(draw, subtitle, start_y + 190, font_medium, fill=(210, 210, 210, 255), letter_spacing=1)

        out_path = os.path.join(OUT_DIR, out_name)
        bg.convert("RGB").save(out_path, "JPEG", quality=95)
        print(f"Generated {out_path}")
        
    except Exception as e:
        print(f"Error processing {out_name}: {e}")

print("Generating Report Hook Posts...")

posts = [
    # Wealth
    ("hook_wealth_1.png", "hook_01_wealth.jpg", "我命裡到底有沒有偏財運？", "一對一五行命理財富解析", "WEALTH DESTINY", "center"),
    ("hook_wealth_2.png", "hook_02_wealth.jpg", "為什麼總是存不到錢？", "找出你命盤中的漏財危機", "WEALTH LEAKAGE", "bottom"),
    # Love
    ("hook_love_1.png", "hook_03_love.jpg", "他到底是不是我的正緣？", "從五行合盤看透雙方契合度", "TRUE LOVE DESTINY", "center"),
    ("hook_love_2.png", "hook_04_love.jpg", "我的桃花期到底在幾歲？", "解鎖你的流年感情運勢", "ROMANCE TIMELINE", "top"),
    # Career
    ("hook_career_1.png", "hook_05_career.jpg", "今年該跳槽，還是繼續熬？", "五行事業流年深度解析", "CAREER CROSSROADS", "bottom"),
    ("hook_career_2.png", "hook_06_career.jpg", "我的事業轉折點在哪裡？", "掌握命盤中的升職機遇", "CAREER BREAKTHROUGH", "center"),
    # Health/Energy
    ("hook_health_1.png", "hook_07_energy.jpg", "為什麼最近總是覺得運勢卡卡？", "找出讓你磁場受阻的原因", "ENERGY CLEARING", "center"),
    ("hook_health_2.png", "hook_08_energy.jpg", "你的五行，到底缺了什麼？", "專屬個人能量平衡報告", "FIVE ELEMENTS BALANCE", "center"),
]

for bg, out, title, sub, eng, align in posts:
    create_hook_post(bg, out, title, sub, eng, align)

print("Done!")