import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUTPUT_DIR = "/Users/michaelng/Desktop/marketing/shopping_assistant_promo_tc_20260510"

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
    overlay1 = Image.new("RGBA", page1.size, (0, 0, 0, 110)) 
    page1 = Image.alpha_composite(page1, overlay1)
    draw1 = ImageDraw.Draw(page1)
    
    draw_text_center(draw1, eng_text, int(img_h * 0.25), font_eng, img_w, fill=(200, 200, 200))
    line_y = int(img_h * 0.25) + 40
    line_w = 200
    draw1.line([((img_w - line_w) // 2, line_y), ((img_w + line_w) // 2, line_y)], fill=(200, 200, 200), width=2)
    
    draw_text_center(draw1, hook_text, int(img_h * 0.35), font_hook, img_w, fill=(255, 255, 255), line_spacing=25)
    draw_text_center(draw1, sub_text, int(img_h * 0.65), font_sub, img_w, fill=(240, 230, 200))
    
    bottom_cta = "向左滑，讓小風幫你挑"
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
    
    chat_path = os.path.join(ASSETS_DIR, chat_filename)
    if os.path.exists(chat_path):
        chat_img = Image.open(chat_path).convert("RGBA")
        
        target_chat_height = int(img_h * 0.60)
        aspect_ratio = chat_img.width / chat_img.height
        target_chat_width = int(target_chat_height * aspect_ratio)
        
        if target_chat_width > int(img_w * 0.85):
            target_chat_width = int(img_w * 0.85)
            target_chat_height = int(target_chat_width / aspect_ratio)
            
        chat_img = chat_img.resize((target_chat_width, target_chat_height), Image.Resampling.LANCZOS)
        
        mask = Image.new("L", chat_img.size, 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.rounded_rectangle([(0, 0), chat_img.size], radius=20, fill=255)
        chat_img.putalpha(mask)
        
        shadow = Image.new("RGBA", (chat_img.width + 40, chat_img.height + 40), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle([(20, 20), (chat_img.width + 20, chat_img.height + 20)], radius=20, fill=(0, 0, 0, 120))
        shadow = shadow.filter(ImageFilter.GaussianBlur(12))
        
        chat_center_y = int(img_h * 0.40)
        chat_x = (img_w - chat_img.width) // 2
        chat_y = chat_center_y - (chat_img.height // 2)
        
        page2.alpha_composite(shadow, (chat_x - 20, chat_y - 20))
        page2.alpha_composite(chat_img, (chat_x, chat_y))
    
    text_y_start = chat_y + target_chat_height + 40
    draw_text_center(draw2, cta_title, text_y_start, font_cta_title, img_w, fill=(240, 230, 200))
    draw_text_center(draw2, cta_sub, text_y_start + 65, font_cta_sub, img_w, fill=(255, 255, 255))
    
    btn_text = "啟動購物助理"
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

posts = [
    {
        "bg": "shop_hook_health.png",
        "hook": "水晶琳瑯滿目，\n到底哪一條才適合我？",
        "sub": "亂買不如買對！你的專屬健康御守",
        "eng": "SHOPPING ASSISTANT",
        "chat": "_____2026-05-10___1.45.27-b4b31c9a-c134-45a6-be96-7af1256a3109.png", # Health
        "out": "post_01_shop_health",
        "cta_title": "AI 購物助理，幫你精準挑選",
        "cta_sub": "結合五行分析，挑出最能補足你能量的水晶"
    },
    {
        "bg": "shop_hook_love.png",
        "hook": "想招桃花，\n粉晶真的適合每個人嗎？",
        "sub": "買錯水晶，小心招來爛桃花！",
        "eng": "YOUR LOVE CRYSTAL",
        "chat": "_____2026-05-10___1.43.37-41f7cb3f-2b0c-485e-a97e-2b1eb5e552bd.png", # Love
        "out": "post_02_shop_love",
        "cta_title": "輸入生日，找尋你的正緣晶石",
        "cta_sub": "讓購物助理小風，為你創造吸引好能量的儀式感"
    },
    {
        "bg": "shop_hook_wealth.png",
        "hook": "想提升財運，\n哪款水晶最能帶旺我？",
        "sub": "每個人的財庫密碼都不一樣！",
        "eng": "WEALTH & PROSPERITY",
        "chat": "_____2026-05-10___1.42.26-444fbeec-c030-4014-b793-5db8686ca171.png", # Wealth
        "out": "post_03_shop_wealth",
        "cta_title": "專屬選品，幫你補足財庫能量",
        "cta_sub": "不再盲目挑選，小風幫你找出專屬的開運好物"
    }
]

for p in posts:
    create_carousel_post(
        p["bg"], p["hook"], p["sub"], p["eng"], p["chat"], p["out"], p["cta_title"], p["cta_sub"]
    )
