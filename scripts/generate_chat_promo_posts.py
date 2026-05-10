import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_DIR = "/Users/michaelng/Desktop/marketing/chat_assistant_promo_tc_20260510"

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

def create_carousel_post(bg_filename, hook_text, sub_text, eng_text, chat_filename, out_prefix, cta_title, cta_sub):
    bg_path = os.path.join(ASSETS_DIR, bg_filename)
    if not os.path.exists(bg_path):
        print(f"Warning: {bg_path} not found. Skipping.")
        return

    bg_img = Image.open(bg_path).convert("RGBA")
    img_w, img_h = bg_img.size
    
    # ---------------- PAGE 1: HOOK ----------------
    page1 = bg_img.copy()
    overlay1 = Image.new("RGBA", page1.size, (0, 0, 0, 110)) # Darker overlay
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
    bottom_cta = "向左滑，聽聽小鈴怎麼說"
    bottom_y = img_h - 100
    draw_text_center(draw1, bottom_cta, bottom_y, font_cta_sub, img_w, fill=(255, 255, 255))
    
    line_cta_y = bottom_y + 50
    draw1.line([((img_w - 200) // 2, line_cta_y), ((img_w + 200) // 2, line_cta_y)], fill=(255, 255, 255), width=1)
    
    page1.convert("RGB").save(os.path.join(OUTPUT_DIR, f"{out_prefix}_p1_hook.jpg"), quality=95)
    
    # ---------------- PAGE 2: CTA/REPORT ----------------
    page2 = bg_img.copy().filter(ImageFilter.GaussianBlur(15))
    overlay2 = Image.new("RGBA", page2.size, (0, 0, 0, 150)) 
    page2 = Image.alpha_composite(page2, overlay2)
    draw2 = ImageDraw.Draw(page2)
    
    # Load and scale chat image
    chat_path = os.path.join(ASSETS_DIR, chat_filename)
    if os.path.exists(chat_path):
        chat_img = Image.open(chat_path).convert("RGBA")
        
        target_chat_height = int(img_h * 0.55)
        aspect_ratio = chat_img.width / chat_img.height
        target_chat_width = int(target_chat_height * aspect_ratio)
        
        if target_chat_width > int(img_w * 0.85):
            target_chat_width = int(img_w * 0.85)
            target_chat_height = int(target_chat_width / aspect_ratio)
            
        chat_img = chat_img.resize((target_chat_width, target_chat_height), Image.Resampling.LANCZOS)
        
        # Add rounded corners
        mask = Image.new("L", chat_img.size, 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.rounded_rectangle([(0, 0), chat_img.size], radius=20, fill=255)
        chat_img.putalpha(mask)
        
        # Drop shadow
        shadow = Image.new("RGBA", (chat_img.width + 40, chat_img.height + 40), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle([(20, 20), (chat_img.width + 20, chat_img.height + 20)], radius=20, fill=(0, 0, 0, 120))
        shadow = shadow.filter(ImageFilter.GaussianBlur(12))
        
        chat_center_y = int(img_h * 0.38)
        chat_x = (img_w - chat_img.width) // 2
        chat_y = chat_center_y - (chat_img.height // 2)
        
        page2.alpha_composite(shadow, (chat_x - 20, chat_y - 20))
        page2.alpha_composite(chat_img, (chat_x, chat_y))
    
    # Bottom CTA Text
    text_y_start = chat_y + target_chat_height + 40
    draw_text_center(draw2, cta_title, text_y_start, font_cta_title, img_w, fill=(240, 230, 200))
    draw_text_center(draw2, cta_sub, text_y_start + 65, font_cta_sub, img_w, fill=(255, 255, 255))
    
    # CTA Button
    btn_text = "開始專屬對話"
    bbox_btn = font_cta_medium.getbbox(btn_text)
    btn_text_w = bbox_btn[2] - bbox_btn[0]
    btn_w = btn_text_w + 100
    btn_h = 70
    btn_x = (img_w - btn_w) // 2
    btn_y = text_y_start + 125
    
    if btn_y + btn_h > img_h - 20:
        btn_y = img_h - btn_h - 20
        
    draw2.rounded_rectangle([(btn_x, btn_y), (btn_x + btn_w, btn_y + btn_h)], radius=35, fill=(240, 230, 200))
    
    text_x = btn_x + (btn_w - btn_text_w) // 2
    text_y = btn_y + (btn_h - (bbox_btn[3] - bbox_btn[1])) // 2 - 5
    draw2.text((text_x, text_y), btn_text, font=font_cta_medium, fill=(30, 30, 30))
    
    page2.convert("RGB").save(os.path.join(OUTPUT_DIR, f"{out_prefix}_p2_cta.jpg"), quality=95)
    print(f"Generated {out_prefix}")

# Configuration for the 5 chat promo posts
posts = [
    {
        "bg": "chat_hook_health_stomach.png",
        "hook": "壓力大到腸胃不適？\n有些話，不敢跟別人說",
        "sub": "讓小鈴陪伴你，找回身心平衡",
        "eng": "EMOTIONAL HEALING",
        "chat": "_____2026-05-10___1.36.09-ea1dac6b-5ae8-4c74-ad35-9e6f792b02ce.png",
        "out": "post_01_chat_stomach",
        "cta_title": "AI 專屬陪伴，溫柔懂你",
        "cta_sub": "傾聽你的煩惱，結合生辰八字給出五行解方"
    },
    {
        "bg": "chat_hook_wealth.png",
        "hook": "覺得最近財運卡卡，\n好想被幸運之神眷顧？",
        "sub": "想中大獎？先看看你的偏財運",
        "eng": "WEALTH & LUCK",
        "chat": "_____2026-05-10___1.32.59-fcfa64ed-d86a-44e4-aa91-9c6a1edada3c.png",
        "out": "post_02_chat_wealth",
        "cta_title": "想找點靈感？讓小鈴陪你聊聊",
        "cta_sub": "透過五行密碼，發掘專屬於你的幸運方向"
    },
    {
        "bg": "chat_hook_tired.png",
        "hook": "睡再久還是覺得累？\n你的心，忘了充電嗎",
        "sub": "生活節奏亂了套，需要一個傾聽者",
        "eng": "RECHARGE YOUR SOUL",
        "chat": "_____2026-05-10___1.31.47-4f77d9a4-459c-4714-a3f4-1c4fe80888e6.png",
        "out": "post_03_chat_tired",
        "cta_title": "情緒舒緩，專屬八字建議",
        "cta_sub": "不再一個人硬撐，找出讓你身心耗損的原因"
    },
    {
        "bg": "chat_hook_career.png",
        "hook": "明明很努力，\n卻總是不被看見？",
        "sub": "升遷卡關、職涯迷惘時的避風港",
        "eng": "CAREER GUIDANCE",
        "chat": "_____2026-05-10___1.38.05-d9d2bcc3-1fa5-4bf4-b042-c991f41cb1b5.png",
        "out": "post_04_chat_career",
        "cta_title": "化解迷惘，幫你找回職場底氣",
        "cta_sub": "輸入生日，看見你的五行優勢與隱形阻礙"
    },
    {
        "bg": "chat_hook_love.png",
        "hook": "總覺得對的人\n還在迷路？",
        "sub": "感情空窗期，你需要溫暖的指引",
        "eng": "LOVE & RELATIONSHIPS",
        "chat": "_____2026-05-10___1.35.14-646d4a34-dcd3-45d7-9f7f-62cbdaf432f9.png",
        "out": "post_05_chat_love",
        "cta_title": "你的感情煩惱，小鈴都懂",
        "cta_sub": "結合五行命盤分析，幫你調整桃花磁場"
    }
]

for p in posts:
    create_carousel_post(
        p["bg"], p["hook"], p["sub"], p["eng"], p["chat"], p["out"], p["cta_title"], p["cta_sub"]
    )
