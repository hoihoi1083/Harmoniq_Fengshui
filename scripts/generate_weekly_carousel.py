import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_DIR = "/Users/michaelng/Desktop/marketing/weekly_advice_carousel_tc_20260510"
# In case the font is in the repo, try repo first, then cursor assets
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
font_cta_title = ImageFont.truetype(FONT_PATH, 50)
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
    overlay1 = Image.new("RGBA", page1.size, (0, 0, 0, 130)) # Darker overlay for readability
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
    bottom_cta = "向左滑查看本週空間建議"
    bottom_y = img_h - 100
    draw_text_center(draw1, bottom_cta, bottom_y, font_cta_sub, img_w, fill=(255, 255, 255))
    
    line_cta_y = bottom_y + 50
    draw1.line([((img_w - 180) // 2, line_cta_y), ((img_w + 180) // 2, line_cta_y)], fill=(255, 255, 255), width=1)
    
    page1.convert("RGB").save(os.path.join(OUTPUT_DIR, f"{out_prefix}_p1_hook.jpg"), quality=95)
    
    # ---------------- PAGE 2: CTA/REPORT ----------------
    page2 = bg_img.copy().filter(ImageFilter.GaussianBlur(15))
    overlay2 = Image.new("RGBA", page2.size, (0, 0, 0, 160)) # Even darker for report
    page2 = Image.alpha_composite(page2, overlay2)
    draw2 = ImageDraw.Draw(page2)
    
    # Load and scale weekly advice image
    report_path = os.path.join(ASSETS_DIR, report_filename)
    if os.path.exists(report_path):
        report_img = Image.open(report_path).convert("RGBA")
        
        # Target dimension: scale dynamically based on image height
        target_report_height = int(img_h * 0.62)
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
        
        # Paste report with center alignment
        report_center_y = int(img_h * 0.42)
        report_x = (img_w - report_img.width) // 2
        report_y = report_center_y - (report_img.height // 2)
        
        page2.alpha_composite(shadow, (report_x - 20, report_y - 20))
        page2.alpha_composite(report_img, (report_x, report_y))
    
    # Bottom CTA Text
    text_y_start = report_y + target_report_height + 30
    draw_text_center(draw2, cta_title, text_y_start, font_cta_title, img_w, fill=(240, 230, 200))
    draw_text_center(draw2, cta_sub, text_y_start + 60, font_cta_sub, img_w, fill=(255, 255, 255))
    
    # CTA Button
    btn_text = "立即測算本週運勢"
    bbox_btn = font_cta_medium.getbbox(btn_text)
    btn_text_w = bbox_btn[2] - bbox_btn[0]
    btn_w = btn_text_w + 100
    btn_h = 70
    btn_x = (img_w - btn_w) // 2
    btn_y = text_y_start + 115
    
    # Prevent button from going off screen
    if btn_y + btn_h > img_h - 20:
        # squish things up a bit if too tight
        btn_y = img_h - btn_h - 20
        
    draw2.rounded_rectangle([(btn_x, btn_y), (btn_x + btn_w, btn_y + btn_h)], radius=35, fill=(240, 230, 200))
    
    # Center text in button manually
    text_x = btn_x + (btn_w - btn_text_w) // 2
    text_y = btn_y + (btn_h - (bbox_btn[3] - bbox_btn[1])) // 2 - 5 # slight visual adjustment
    draw2.text((text_x, text_y), btn_text, font=font_cta_medium, fill=(30, 30, 30))
    
    page2.convert("RGB").save(os.path.join(OUTPUT_DIR, f"{out_prefix}_p2_cta.jpg"), quality=95)
    print(f"Generated {out_prefix}")

# Configuration for the 4 weekly advice posts
posts = [
    {
        "bg": "hook_weekly_1.png",
        "hook": "覺得最近\n心浮氣躁？",
        "sub": "本週空間風水調整指南",
        "eng": "WEEKLY FENG SHUI",
        "report": "_____2026-05-10___1.15.11-791c3006-90f0-4988-895f-26bb2a6b416e.png",
        "out": "post_01_weekly_flow",
        "cta_title": "本週運勢與空間建議",
        "cta_sub": "檢視東南方動線，找回平靜節奏"
    },
    {
        "bg": "hook_weekly_2.png",
        "hook": "晚上總是\n睡不好？",
        "sub": "臥室光源與動線佈局建議",
        "eng": "ENERGY & LIGHT",
        "report": "_____2026-05-10___1.15.11-791c3006-90f0-4988-895f-26bb2a6b416e.png",
        "out": "post_02_weekly_light",
        "cta_title": "本週運勢與空間建議",
        "cta_sub": "微調居家光源，穩定內在磁場"
    },
    {
        "bg": "hook_weekly_3.png",
        "hook": "容易焦慮、\n想一次做完所有事？",
        "sub": "火氣過旺的居家化解法",
        "eng": "FIVE ELEMENTS BALANCE",
        "report": "_____2026-05-10___1.15.24-0c2f3e7c-7b6b-41e9-90e4-62b20aeb99ce.png",
        "out": "post_03_weekly_color",
        "cta_title": "本週運勢與空間建議",
        "cta_sub": "運用冷色系調和，沉澱心火"
    },
    {
        "bg": "hook_weekly_4.png",
        "hook": "工作常常\n無法集中精神？",
        "sub": "書桌朝向與五行開運法",
        "eng": "WORKSPACE ENERGY",
        "report": "_____2026-05-10___1.15.24-0c2f3e7c-7b6b-41e9-90e4-62b20aeb99ce.png",
        "out": "post_04_weekly_focus",
        "cta_title": "本週運勢與空間建議",
        "cta_sub": "避開直射方位，讓思緒更清晰"
    }
]

for p in posts:
    create_carousel_post(
        p["bg"], p["hook"], p["sub"], p["eng"], p["report"], p["out"], p["cta_title"], p["cta_sub"]
    )
