import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/social_posts_20260510"

os.makedirs(OUT_DIR, exist_ok=True)

# UI Elements from User
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

def overlay_ui(bg_path, out_name, ui_elements=None):
    try:
        bg = Image.open(bg_path).convert("RGBA")
        bg = ImageOps.fit(bg, POST_SIZE, Image.Resampling.LANCZOS)
        
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
                
                # Add rounded corners
                ui_img = add_corners(ui_img, rad=20)
                
                if rotate != 0:
                    ui_img = ui_img.rotate(rotate, expand=True, resample=Image.Resampling.BICUBIC)
                
                # Add drop shadow
                ui_img_with_shadow = add_drop_shadow(ui_img)
                
                bg.paste(ui_img_with_shadow, pos, ui_img_with_shadow)
                
        out_path = os.path.join(OUT_DIR, out_name)
        bg.convert("RGB").save(out_path, "JPEG", quality=90)
        print(f"Generated {out_path}")
    except Exception as e:
        print(f"Error processing {out_name}: {e}")

print("Starting generation of 10 Social Media Posts...")

# Post 1: Golden Pixiu (Product)
overlay_ui(os.path.join(ASSETS_DIR, "post1_bg.png"), "post_01_golden_pixiu.jpg")

# Post 2: Report Value
overlay_ui(os.path.join(ASSETS_DIR, "post2_bg.png"), "post_02_report_value.jpg", [
    {'path': UI_REPORT1, 'scale': 0.6, 'pos': (250, 100), 'rotate': -5}
])

# Post 3: Alashan Double Loop (Product)
overlay_ui(os.path.join(ASSETS_DIR, "post3_bg.png"), "post_03_alashan_bracelet.jpg")

# Post 4: Report + Gift
overlay_ui(os.path.join(ASSETS_DIR, "post4_bg.png"), "post_04_gift_report.jpg", [
    {'path': UI_REPORT2, 'scale': 0.55, 'pos': (400, 150), 'rotate': 8}
])

# Post 5: Strawberry Quartz (Product)
overlay_ui(os.path.join(ASSETS_DIR, "post5_bg.png"), "post_05_strawberry_quartz.jpg")

# Post 6: Lifestyle/Model
overlay_ui(os.path.join(ASSETS_DIR, "post6_bg.png"), "post_06_lifestyle.jpg")

# Post 7: Chatroom
overlay_ui(os.path.join(ASSETS_DIR, "post7_bg.png"), "post_07_chatroom.jpg", [
    {'path': UI_CHATROOM, 'scale': 0.9, 'pos': (50, 50), 'rotate': -2},
    {'path': UI_ASSISTANT, 'scale': 0.8, 'pos': (300, 450), 'rotate': 3}
])

# Post 8: Weekly Advice
overlay_ui(os.path.join(ASSETS_DIR, "post8_bg.png"), "post_08_weekly_advice.jpg", [
    {'path': UI_REPORT3, 'scale': 0.65, 'pos': (200, 150), 'rotate': 0}
])

# Post 9: Bundle
overlay_ui(os.path.join(ASSETS_DIR, "post9_bg.png"), "post_09_bundle.jpg", [
    {'path': UI_SHOP, 'scale': 0.7, 'pos': (-100, 100), 'rotate': -4},
    {'path': UI_BANNERS, 'scale': 0.8, 'pos': (300, 600), 'rotate': 5}
])

# Post 10: Action (Doorway)
overlay_ui(os.path.join(ASSETS_DIR, "post10_bg.png"), "post_10_action.jpg", [
    {'path': UI_CHATROOM, 'scale': 0.8, 'pos': (100, 750), 'rotate': 0}
])

print("All posts generated successfully!")
