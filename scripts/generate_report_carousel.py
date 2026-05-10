import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
REPORT_ASSETS = "/Users/michaelng/Desktop/marketing/report_assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/report_hooks_carousel_tc_20260510"

os.makedirs(OUT_DIR, exist_ok=True)

FONT_PATH = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")

try:
    font_hook_large = ImageFont.truetype(FONT_PATH, 95)
    font_hook_medium = ImageFont.truetype(FONT_PATH, 40)
    font_hook_small = ImageFont.truetype(FONT_PATH, 26)
    
    font_cta_large = ImageFont.truetype(FONT_PATH, 60)
    font_cta_medium = ImageFont.truetype(FONT_PATH, 35)
except Exception as e:
    print(f"Error loading fonts: {e}")

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

def draw_text_center(draw, text, y_pos, font, fill=(255, 255, 255), line_spacing=15):
    lines = text.split('\n')
    current_y = y_pos
    for line in lines:
        try:
            w = draw.textlength(line, font=font)
        except:
            w = draw.textsize(line, font=font)[0]
        x_pos = (POST_SIZE[0] - w) / 2
        # Thick shadow for readability
        for offset_x in [-3, 0, 3]:
            for offset_y in [-3, 0, 3]:
                draw.text((x_pos+offset_x, current_y+offset_y), line, font=font, fill=(0,0,0,120))
        draw.text((x_pos+4, current_y+4), line, font=font, fill=(0,0,0,255))
        draw.text((x_pos, current_y), line, font=font, fill=fill)
        current_y += font.size + line_spacing
    return current_y

def create_carousel_post(bg_file, report_file, out_name_p1, out_name_p2, main_title, subtitle, eng_text, cta_title, cta_subtitle, align='center'):
    try:
        # ----- PAGE 1: HOOK -----
        bg_path = os.path.join(ASSETS_DIR, bg_file)
        bg1 = Image.open(bg_path).convert("RGBA")
        bg1 = ImageOps.fit(bg1, POST_SIZE, Image.Resampling.LANCZOS)
        
        overlay = Image.new('RGBA', POST_SIZE, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)
        
        if align == 'bottom':
            for y in range(POST_SIZE[1]-650, POST_SIZE[1]):
                alpha = int(240 * ((y - (POST_SIZE[1]-650)) / 650))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'center':
            for y in range(POST_SIZE[1]//2 - 400, POST_SIZE[1]//2 + 400):
                dist_from_center = abs(y - POST_SIZE[1]//2)
                alpha = int(220 * (1 - (dist_from_center / 400)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'top':
            for y in range(650):
                alpha = int(240 * (1 - (y / 650)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
                
        bg1 = Image.alpha_composite(bg1, overlay)
        draw1 = ImageDraw.Draw(bg1)
        
        if align == 'bottom':
            start_y = POST_SIZE[1] - 400
        elif align == 'center':
            start_y = POST_SIZE[1] // 2 - 180
        elif align == 'top':
            start_y = 120
            
        draw_text_center(draw1, eng_text, start_y, font_hook_small, fill=(220, 200, 150, 255))
        title_bottom_y = draw_text_center(draw1, main_title, start_y + 40, font_hook_large, fill=(255, 255, 255, 255))
        draw_text_center(draw1, subtitle, title_bottom_y + 30, font_hook_medium, fill=(210, 210, 210, 255))

        out_path_p1 = os.path.join(OUT_DIR, out_name_p1)
        bg1.convert("RGB").save(out_path_p1, "JPEG", quality=95)
        print(f"Generated {out_path_p1}")

        # ----- PAGE 2: CTA/SOLUTION -----
        bg2 = Image.open(bg_path).convert("RGBA")
        bg2 = ImageOps.fit(bg2, POST_SIZE, Image.Resampling.LANCZOS)
        bg2 = bg2.filter(ImageFilter.GaussianBlur(15))
        overlay2 = Image.new('RGBA', POST_SIZE, (0, 0, 0, 180))
        bg2 = Image.alpha_composite(bg2, overlay2)
        
        if report_file.startswith("_____"):
            report_path = os.path.join(ASSETS_DIR, report_file)
        else:
            report_path = os.path.join(REPORT_ASSETS, report_file)
            
        report_img = Image.open(report_path).convert("RGBA")
        aspect = report_img.height / report_img.width
        
        # Fit report within max height so it doesn't get cut off
        target_report_height = 620
        target_report_width = int(target_report_height / aspect)
        
        if target_report_width > 800: # if it's super wide for some reason
            target_report_width = 800
            target_report_height = int(target_report_width * aspect)
            
        report_img = report_img.resize((target_report_width, target_report_height), Image.Resampling.LANCZOS)
        
        report_with_shadow = add_drop_shadow(report_img, offset=(0, 20), shadow_blur_rad=30, shadow_color=(0,0,0,255))
        
        paste_x = (POST_SIZE[0] - report_with_shadow.width) // 2
        paste_y = 200
        bg2.paste(report_with_shadow, (paste_x, paste_y), report_with_shadow)
        
        draw2 = ImageDraw.Draw(bg2)
        draw_text_center(draw2, cta_title, 60, font_cta_large, fill=(255, 255, 255))
        draw_text_center(draw2, cta_subtitle, 135, font_cta_medium, fill=(220, 200, 150))
        
        btn_w = 400
        btn_h = 80
        btn_x = (POST_SIZE[0] - btn_w) // 2
        btn_y = POST_SIZE[1] - 140
        draw2.rounded_rectangle([btn_x, btn_y, btn_x+btn_w, btn_y+btn_h], radius=40, fill=(200, 160, 80))
        btn_text = "立即前往測算"
        bw = draw2.textlength(btn_text, font=font_cta_medium)
        draw2.text((btn_x + (btn_w - bw)//2, btn_y + 18), btn_text, font=font_cta_medium, fill=(255, 255, 255))
        
        out_path_p2 = os.path.join(OUT_DIR, out_name_p2)
        bg2.convert("RGB").save(out_path_p2, "JPEG", quality=95)
        print(f"Generated {out_path_p2}")
        
    except Exception as e:
        print(f"Error processing {out_name_p1}: {e}")

print("Generating Carousel Posts (Hook + CTA)...")

posts = [
    # Wealth
    ("hook_wealth_1.png", "_____2026-05-10___12.59.44-3ff2346a-5e6e-433e-8165-e9711779f967.png", "post_01_wealth_p1_hook.jpg", "post_01_wealth_p2_cta.jpg", "我命裡到底\n有沒有偏財運？", "一對一五行命理財富解析", "WEALTH DESTINY", "專屬開運建議", "佈局專屬財庫位，迎接好運", "center"),
    ("hook_wealth_2.png", "_____2026-05-10___1.02.57-bcc526f9-898f-4771-900e-5a6f68b971b1.png", "post_02_wealth_p1_hook.jpg", "post_02_wealth_p2_cta.jpg", "為什麼總是\n存不到錢？", "找出你命盤中的漏財危機", "WEALTH LEAKAGE", "專屬開運禁忌指南", "避開流年破財雷區，守住財庫", "bottom"),
    # Love
    ("hook_love_1.png", "_____2026-05-10___1.04.24-3e31359b-e755-4ec6-bee7-df34dbe6ed3d.png", "post_03_love_p1_hook.jpg", "post_03_love_p2_cta.jpg", "他到底是不是\n我的正緣？", "從五行合盤看透雙方契合度", "TRUE LOVE DESTINY", "專屬感情合盤解析", "輸入兩人信息，看透彼此契合度", "center"),
    ("hook_love_2.png", "_____2026-05-10___1.06.35-87cf9d9e-f73b-4350-a0a8-be775e811ad5.png", "post_04_love_p1_hook.jpg", "post_04_love_p2_cta.jpg", "我的桃花期\n到底在幾歲？", "解鎖你的流年感情運勢", "ROMANCE TIMELINE", "專屬感情流年測算", "預見最佳婚年，避開情劫週期", "top"),
    # Career
    ("hook_career_1.png", "_____2026-05-10___1.07.19-99bd2c25-490f-474f-8f63-202a9b99957a.png", "post_05_career_p1_hook.jpg", "post_05_career_p2_cta.jpg", "今年該跳槽，\n還是繼續熬？", "五行事業流年深度解析", "CAREER CROSSROADS", "專屬事業定位解析", "精準定位優勢，看懂今年發展趨勢", "bottom"),
    ("hook_career_2.png", "_____2026-05-10___1.08.39-651133f9-4b3d-4420-b0ad-bdd662404b73.png", "post_06_career_p1_hook.jpg", "post_06_career_p2_cta.jpg", "我的事業轉折點\n在哪裡？", "掌握命盤中的升職機遇", "CAREER BREAKTHROUGH", "專屬黃金賽道解析", "精準佈局，預見二十年大運軌跡", "center"),
    # Health/Energy
    ("hook_health_1.png", "_____2026-05-10___1.10.03-8f64f778-58d0-48ad-9065-030197f0ace2.png", "post_07_energy_p1_hook.jpg", "post_07_energy_p2_cta.jpg", "為什麼最近總是\n覺得運勢卡卡？", "找出讓你磁場受阻的原因", "ENERGY CLEARING", "專屬核心矛盾解析", "找出卡關盲點，對症下藥化解阻礙", "center"),
    ("hook_health_2.png", "_____2026-05-10___1.10.24-36556552-3ea7-4344-9023-366deff9f48d.png", "post_08_energy_p1_hook.jpg", "post_08_energy_p2_cta.jpg", "你的五行，\n到底缺了什麼？", "專屬個人能量平衡報告", "FIVE ELEMENTS BALANCE", "專屬五行深度解析", "看懂元素缺失，精準疏通命盤阻礙", "center"),
]

for args in posts:
    create_carousel_post(*args)

print("Done!")