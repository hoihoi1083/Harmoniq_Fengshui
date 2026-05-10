import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
WORKSPACE_ASSETS = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/social_posts_with_text_20260510"

os.makedirs(OUT_DIR, exist_ok=True)

# Fonts
FONT_BOLD_PATH = os.path.join(WORKSPACE_ASSETS, "ZCOOLQingKeHuangYou-Regular.ttf")
FONT_REGULAR_PATH = os.path.join(WORKSPACE_ASSETS, "fonts/NotoSerifTC.ttf")

try:
    font_title = ImageFont.truetype(FONT_BOLD_PATH, 110)
    font_subtitle = ImageFont.truetype(FONT_REGULAR_PATH, 50)
except Exception as e:
    print(f"Error loading fonts: {e}")
    # Fallback
    font_title = ImageFont.load_default()
    font_subtitle = ImageFont.load_default()

# UI Elements
UI_CHATROOM = os.path.join(ASSETS_DIR, "_____2026-05-10___10.50.09-b817dccf-9d93-40ab-a462-6cc8a9e0b399.png")
UI_SHOP = os.path.join(ASSETS_DIR, "_____2026-05-10___10.50.20-55c95f93-a6a5-4c6b-8acc-dfba0b2f2dc7.png")
UI_ASSISTANT = os.path.join(ASSETS_DIR, "_____2026-05-10___10.50.32-bb8f074b-0082-436c-a3cf-0a843888ff57.png")
UI_BANNERS = os.path.join(ASSETS_DIR, "_____2026-05-10___10.50.51-18718a7f-f536-4900-be73-9513b0e495c1.png")
UI_REPORT1 = os.path.join(ASSETS_DIR, "_____2026-05-10___10.51.17-db370e9c-79fa-49a7-b214-485c52f4cd43.png")
UI_REPORT2 = os.path.join(ASSETS_DIR, "_____2026-05-10___10.51.24-64effa34-cf7e-436f-870e-cee74647fc55.png")
UI_REPORT3 = os.path.join(ASSETS_DIR, "_____2026-05-10___10.51.33-9ccc67c4-adce-4b0e-bee5-dd4919a95b9a.png")

POST_SIZE = (1080, 1080)

def add_corners(im, rad):
    circle = Image.new('L', (rad * 2, rad * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, rad * 2 - 1, rad * 2 - 1), fill=255)
    alpha = Image.new('L', im.size, 255)
    w, h = im.size
    alpha.paste(circle.crop((0, 0, rad, rad)), (0, 0))
    alpha.paste(circle.crop((0, rad, rad, rad * 2)), (0, h - rad))
    alpha.paste(circle.crop((rad, 0, rad * 2, rad)), (w - rad, 0))
    alpha.paste(circle.crop((rad, rad, rad * 2, rad * 2)), (w - rad, h - rad))
    im.putalpha(alpha)
    return im

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

def draw_text_with_shadow(draw, text, position, font, text_color=(255, 255, 255), shadow_color=(0, 0, 0, 150), shadow_offset=(3, 3)):
    x, y = position
    # Draw multiple shadow passes for thicker shadow
    for offset_x in [-2, 0, 2]:
        for offset_y in [-2, 0, 2]:
            draw.text((x + offset_x + shadow_offset[0], y + offset_y + shadow_offset[1]), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=text_color)

def generate_post(bg_path, out_name, title, subtitle, text_position, ui_elements=None, dark_overlay=True):
    try:
        bg = Image.open(bg_path).convert("RGBA")
        bg = ImageOps.fit(bg, POST_SIZE, Image.Resampling.LANCZOS)
        
        # Add a dark gradient overlay at the text position to ensure readability
        if dark_overlay:
            overlay = Image.new('RGBA', POST_SIZE, (0, 0, 0, 0))
            draw_ov = ImageDraw.Draw(overlay)
            if text_position == 'top':
                for y in range(400):
                    alpha = int(180 * (1 - y/400))
                    draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
            elif text_position == 'bottom':
                for y in range(POST_SIZE[1]-400, POST_SIZE[1]):
                    alpha = int(220 * (y - (POST_SIZE[1]-400))/400)
                    draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
            elif text_position == 'center':
                for y in range(POST_SIZE[1]//2 - 200, POST_SIZE[1]//2 + 200):
                    alpha = int(150)
                    draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
            bg = Image.alpha_composite(bg, overlay)
        
        if ui_elements:
            for ui_info in ui_elements:
                path = ui_info['path']
                scale = ui_info.get('scale', 1.0)
                pos = ui_info.get('pos', (0, 0))
                rotate = ui_info.get('rotate', 0)
                
                ui_img = Image.open(path).convert("RGBA")
                new_w = int(ui_img.width * scale)
                new_h = int(ui_img.height * scale)
                ui_img = ui_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                ui_img = add_corners(ui_img, rad=20)
                if rotate != 0:
                    ui_img = ui_img.rotate(rotate, expand=True, resample=Image.Resampling.BICUBIC)
                
                ui_img_with_shadow = add_drop_shadow(ui_img)
                bg.paste(ui_img_with_shadow, pos, ui_img_with_shadow)
                
        # Draw Text
        draw = ImageDraw.Draw(bg)
        
        # Calculate text bounds for centering
        try:
            tw = draw.textbbox((0, 0), title, font=font_title)[2]
            sw = draw.textbbox((0, 0), subtitle, font=font_subtitle)[2]
        except AttributeError:
            tw = draw.textlength(title, font=font_title)
            sw = draw.textlength(subtitle, font=font_subtitle)
            
        if text_position == 'top':
            title_y = 60
            sub_y = title_y + 140
        elif text_position == 'bottom':
            title_y = POST_SIZE[1] - 250
            sub_y = title_y + 140
        else: # center
            title_y = POST_SIZE[1]//2 - 100
            sub_y = title_y + 140
            
        # Draw Accent Box behind subtitle
        accent_padding_x = 40
        accent_padding_y = 20
        box_x1 = (POST_SIZE[0] - sw) // 2 - accent_padding_x
        box_y1 = sub_y - accent_padding_y + 10
        box_x2 = (POST_SIZE[0] + sw) // 2 + accent_padding_x
        box_y2 = sub_y + 60 + accent_padding_y
        
        draw.rounded_rectangle([box_x1, box_y1, box_x2, box_y2], radius=15, fill=(200, 160, 80, 230))
            
        draw_text_with_shadow(draw, title, ((POST_SIZE[0] - tw) // 2, title_y), font_title, text_color=(255, 255, 255))
        draw_text_with_shadow(draw, subtitle, ((POST_SIZE[0] - sw) // 2, sub_y), font_subtitle, text_color=(255, 255, 255), shadow_color=(0,0,0,100), shadow_offset=(1,1))

        out_path = os.path.join(OUT_DIR, out_name)
        bg.convert("RGB").save(out_path, "JPEG", quality=95)
        print(f"Generated {out_path}")
    except Exception as e:
        print(f"Error processing {out_name}: {e}")

print("Starting generation of 10 TEXT-FOCUSED Social Media Posts...")

# Post 1: Golden Pixiu
generate_post(
    os.path.join(ASSETS_DIR, "post1_bg.png"), "post_01_golden_pixiu.jpg",
    title="第一条招财手链", subtitle="天然金发晶 · 灰月光貔貅", text_position='top'
)

# Post 2: Report Value
generate_post(
    os.path.join(ASSETS_DIR, "post2_bg.png"), "post_02_report_value.jpg",
    title="不盲目买水晶！", subtitle="下单即赠【专属五行能量报告】", text_position='top',
    ui_elements=[{'path': UI_REPORT1, 'scale': 0.65, 'pos': (200, 400), 'rotate': -2}]
)

# Post 3: Alashan Double Loop
generate_post(
    os.path.join(ASSETS_DIR, "post3_bg.png"), "post_03_alashan_bracelet.jpg",
    title="男女皆宜 质感满分", subtitle="阿拉善玛瑙 × 奇楠沉香双圈", text_position='top'
)

# Post 4: Gift
generate_post(
    os.path.join(ASSETS_DIR, "post4_bg.png"), "post_04_gift_report.jpg",
    title="送礼天花板", subtitle="高级水晶手串 + 专属五行测算", text_position='bottom',
    ui_elements=[{'path': UI_REPORT2, 'scale': 0.6, 'pos': (250, 80), 'rotate': 5}]
)

# Post 5: Strawberry Quartz
generate_post(
    os.path.join(ASSETS_DIR, "post5_bg.png"), "post_05_strawberry_quartz.jpg",
    title="招桃花超灵神器", subtitle="芭蕾甜酒：草莓晶与粉水晶的相遇", text_position='bottom'
)

# Post 6: Lifestyle
generate_post(
    os.path.join(ASSETS_DIR, "post6_bg.png"), "post_06_lifestyle.jpg",
    title="提升日常穿搭质感", subtitle="不仅是能量，更是百搭饰品", text_position='center'
)

# Post 7: Chatroom
generate_post(
    os.path.join(ASSETS_DIR, "post7_bg.png"), "post_07_chatroom.jpg",
    title="纠结买哪条？", subtitle="来聊天室，小风一对一为您选款", text_position='top',
    ui_elements=[
        {'path': UI_CHATROOM, 'scale': 0.95, 'pos': (20, 450), 'rotate': -2},
        {'path': UI_ASSISTANT, 'scale': 0.8, 'pos': (280, 750), 'rotate': 4}
    ]
)

# Post 8: Weekly Advice
generate_post(
    os.path.join(ASSETS_DIR, "post8_bg.png"), "post_08_weekly_advice.jpg",
    title="每周风水开运指南", subtitle="避开禁忌雷区，轻松迎接好运", text_position='top',
    ui_elements=[{'path': UI_REPORT3, 'scale': 0.7, 'pos': (180, 400), 'rotate': 2}]
)

# Post 9: Bundle
generate_post(
    os.path.join(ASSETS_DIR, "post9_bg.png"), "post_09_bundle.jpg",
    title="限时特惠套餐", subtitle="感情合盘流年测算 + 专属开运水晶", text_position='top',
    ui_elements=[
        {'path': UI_BANNERS, 'scale': 0.9, 'pos': (250, 450), 'rotate': 0},
        {'path': UI_SHOP, 'scale': 0.7, 'pos': (-50, 700), 'rotate': -5}
    ]
)

# Post 10: Action
generate_post(
    os.path.join(ASSETS_DIR, "post10_bg.png"), "post_10_action.jpg",
    title="改变，从今天开始", subtitle="迈出提升运势的第一步", text_position='top',
    ui_elements=[{'path': UI_CHATROOM, 'scale': 0.8, 'pos': (100, 600), 'rotate': 0}]
)

print("All TEXT-FOCUSED posts generated successfully!")
