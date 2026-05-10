import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_DIR = "/Users/michaelng/Desktop/marketing/gift_report_promo_tc_20260510"

repo_font = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
if os.path.exists(repo_font):
    FONT_PATH = repo_font
else:
    FONT_PATH = os.path.join(ASSETS_DIR, "fonts", "NotoSerifTC.ttf")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Fonts
font_hook = ImageFont.truetype(FONT_PATH, 95)
font_sub = ImageFont.truetype(FONT_PATH, 36)
font_eng = ImageFont.truetype(FONT_PATH, 24)
font_cta_title = ImageFont.truetype(FONT_PATH, 55)
font_cta_sub = ImageFont.truetype(FONT_PATH, 32)
font_cta_medium = ImageFont.truetype(FONT_PATH, 35)

def draw_text_center(draw, text, y_pos, font, image_width, fill=(255, 255, 255), line_spacing=15):
    lines = text.split('\n')
    current_y = y_pos
    for line in lines:
        bbox = font.getbbox(line)
        text_width = bbox[2] - bbox[0]
        x_pos = (image_width - text_width) // 2
        
        # Thicker shadow for better readability
        shadow_color = (0, 0, 0, 180)
        draw.text((x_pos+2, current_y+2), line, font=font, fill=shadow_color)
        draw.text((x_pos-1, current_y-1), line, font=font, fill=shadow_color)
        draw.text((x_pos+2, current_y-1), line, font=font, fill=shadow_color)
        draw.text((x_pos-1, current_y+2), line, font=font, fill=shadow_color)
        
        draw.text((x_pos, current_y), line, font=font, fill=fill)
        current_y += (bbox[3] - bbox[1]) + line_spacing

def create_carousel_post(bg_filename, hook_text, sub_text, eng_text, report_filename, out_prefix, cta_title, cta_sub):
    bg_path = os.path.join(ASSETS_DIR, bg_filename)
    if not os.path.exists(bg_path):
        print(f"Warning: {bg_path} not found. Skipping.")
        return

    bg_img = Image.open(bg_path).convert("RGBA")
    img_w, img_h = bg_img.size
    
    # ---------------- PAGE 1: HOOK ----------------
    page1 = bg_img.copy()
    overlay1 = Image.new("RGBA", page1.size, (0, 0, 0, 100)) # Darker overlay for readability
    page1 = Image.alpha_composite(page1, overlay1)
    draw1 = ImageDraw.Draw(page1)
    
    # Top accents
    draw_text_center(draw1, eng_text, int(img_h * 0.25), font_eng, img_w, fill=(200, 200, 200))
    # Line separator
    line_y = int(img_h * 0.25) + 40
    line_w = 200
    draw1.line([((img_w - line_w) // 2, line_y), ((img_w + line_w) // 2, line_y)], fill=(200, 200, 200), width=2)
    
    # Hook question
    draw_text_center(draw1, hook_text, int(img_h * 0.35), font_hook, img_w, fill=(255, 255, 255), line_spacing=25)
    
    # Subtitle
    draw_text_center(draw1, sub_text, int(img_h * 0.65), font_sub, img_w, fill=(240, 230, 200))
    
    # Bottom CTA instruction
    bottom_cta = "向左滑解鎖開運秘密"
    bottom_y = img_h - 100
    draw_text_center(draw1, bottom_cta, bottom_y, font_cta_sub, img_w, fill=(255, 255, 255))
    
    line_cta_y = bottom_y + 50
    draw1.line([((img_w - 180) // 2, line_cta_y), ((img_w + 180) // 2, line_cta_y)], fill=(255, 255, 255), width=1)
    
    page1.convert("RGB").save(os.path.join(OUTPUT_DIR, f"{out_prefix}_p1_hook.jpg"), quality=95)
    
    # ---------------- PAGE 2: CTA/REPORT ----------------
    page2 = bg_img.copy().filter(ImageFilter.GaussianBlur(12))
    overlay2 = Image.new("RGBA", page2.size, (0, 0, 0, 150)) # Even darker for report
    page2 = Image.alpha_composite(page2, overlay2)
    draw2 = ImageDraw.Draw(page2)
    
    # Load and scale report image
    report_path = os.path.join(ASSETS_DIR, report_filename)
    if os.path.exists(report_path):
        report_img = Image.open(report_path).convert("RGBA")
        
        target_report_height = int(img_h * 0.58)
        aspect_ratio = report_img.width / report_img.height
        target_report_width = int(target_report_height * aspect_ratio)
        
        # Max width constraint
        if target_report_width > int(img_w * 0.85):
            target_report_width = int(img_w * 0.85)
            target_report_height = int(target_report_width / aspect_ratio)
            
        report_img = report_img.resize((target_report_width, target_report_height), Image.Resampling.LANCZOS)
        
        # Add rounded corners
        mask = Image.new("L", report_img.size, 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.rounded_rectangle([(0, 0), report_img.size], radius=15, fill=255)
        report_img.putalpha(mask)
        
        # Drop shadow
        shadow = Image.new("RGBA", (report_img.width + 40, report_img.height + 40), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle([(20, 20), (report_img.width + 20, report_img.height + 20)], radius=15, fill=(0, 0, 0, 150))
        shadow = shadow.filter(ImageFilter.GaussianBlur(10))
        
        report_center_y = int(img_h * 0.40)
        report_x = (img_w - report_img.width) // 2
        report_y = report_center_y - (report_img.height // 2)
        
        page2.alpha_composite(shadow, (report_x - 20, report_y - 20))
        page2.alpha_composite(report_img, (report_x, report_y))
    
    # Bottom CTA Text - Highlighted color for the word "贈" or general title
    text_y_start = report_y + target_report_height + 40
    draw_text_center(draw2, cta_title, text_y_start, font_cta_title, img_w, fill=(240, 210, 150)) # Golden color for promotion
    draw_text_center(draw2, cta_sub, text_y_start + 70, font_cta_sub, img_w, fill=(255, 255, 255))
    
    # CTA Button
    btn_text = "立即結緣專屬水晶"
    bbox_btn = font_cta_medium.getbbox(btn_text)
    btn_text_w = bbox_btn[2] - bbox_btn[0]
    btn_w = btn_text_w + 100
    btn_h = 70
    btn_x = (img_w - btn_w) // 2
    btn_y = text_y_start + 130
    
    if btn_y + btn_h > img_h - 20:
        btn_y = img_h - btn_h - 20
        
    draw2.rounded_rectangle([(btn_x, btn_y), (btn_x + btn_w, btn_y + btn_h)], radius=35, fill=(240, 210, 150))
    
    text_x = btn_x + (btn_w - btn_text_w) // 2
    text_y = btn_y + (btn_h - (bbox_btn[3] - bbox_btn[1])) // 2 - 5
    draw2.text((text_x, text_y), btn_text, font=font_cta_medium, fill=(30, 30, 30))
    
    page2.convert("RGB").save(os.path.join(OUTPUT_DIR, f"{out_prefix}_p2_cta.jpg"), quality=95)
    print(f"Generated {out_prefix}")

# Configuration for the 4 promo posts
posts = [
    {
        "bg": "gift_report_bg_1.png",
        "hook": "為什麼別人的水晶\n特別靈驗？",
        "sub": "揭開水晶開運的真正秘密",
        "eng": "CRYSTAL SECRETS",
        "report": "_____2026-05-10___12.59.44-3ff2346a-5e6e-433e-8165-e9711779f967.png", # Wealth report
        "out": "post_01_promo_secret",
        "cta_title": "結緣水晶 免費贈專屬報告",
        "cta_sub": "水晶提升能量，報告指引方向，缺一不可！"
    },
    {
        "bg": "gift_report_bg_2.png",
        "hook": "買了水晶\n卻不知道怎麼戴最有效？",
        "sub": "別讓你的水晶只是裝飾品",
        "eng": "YOUR GUIDE TO LUCK",
        "report": "_____2026-05-10___1.04.24-3e31359b-e755-4ec6-bee7-df34dbe6ed3d.png", # Love report
        "out": "post_02_promo_guide",
        "cta_title": "專屬報告：你的開運說明書",
        "cta_sub": "結緣即贈！看懂八字，精準發揮水晶能量。"
    },
    {
        "bg": "gift_report_bg_3.png",
        "hook": "水晶能補能量，\n但核心問題解開了嗎？",
        "sub": "治標更要治本的開運法",
        "eng": "ENERGY & STRATEGY",
        "report": "_____2026-05-10___1.10.03-8f64f778-58d0-48ad-9065-030197f0ace2.png", # Health/Energy report
        "out": "post_03_promo_core",
        "cta_title": "能量調頻 ＋ 精準佈局",
        "cta_sub": "帶走水晶，送你專屬命盤解析，對症下藥。"
    },
    {
        "bg": "gift_report_bg_4.png",
        "hook": "只有天然水晶\n還不夠！",
        "sub": "你需要的是「專屬開運策略」",
        "eng": "PERFECT COMBINATION",
        "report": "_____2026-05-10___1.07.19-99bd2c25-490f-474f-8f63-202a9b99957a.png", # Career report
        "out": "post_04_promo_strategy",
        "cta_title": "水晶與風水的完美結合",
        "cta_sub": "結緣指定晶石，即贈報告為你打造好運磁場。"
    }
]

for p in posts:
    create_carousel_post(
        p["bg"], p["hook"], p["sub"], p["eng"], p["report"], p["out"], p["cta_title"], p["cta_sub"]
    )
