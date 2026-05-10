import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/editorial_posts_tc_20260510"

os.makedirs(OUT_DIR, exist_ok=True)

# Using NotoSerifTC for everything to guarantee NO missing characters
FONT_PATH = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")

try:
    font_large = ImageFont.truetype(FONT_PATH, 100)
    font_medium = ImageFont.truetype(FONT_PATH, 42)
    font_small = ImageFont.truetype(FONT_PATH, 24)
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

def create_editorial_post(bg_file, out_name, main_title, subtitle, eng_text, align='bottom'):
    try:
        bg_path = os.path.join(ASSETS_DIR, bg_file)
        if not os.path.exists(bg_path):
            print(f"File not found: {bg_path}")
            return

        bg = Image.open(bg_path).convert("RGBA")
        # Crop and resize the raw images which might be horizontal (1536x1024) to square (1080x1080)
        bg = ImageOps.fit(bg, POST_SIZE, Image.Resampling.LANCZOS)
        
        overlay = Image.new('RGBA', POST_SIZE, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)
        
        if align == 'bottom':
            for y in range(POST_SIZE[1]-600, POST_SIZE[1]):
                alpha = int(220 * ((y - (POST_SIZE[1]-600)) / 600))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'center':
            for y in range(POST_SIZE[1]//2 - 300, POST_SIZE[1]//2 + 300):
                dist_from_center = abs(y - POST_SIZE[1]//2)
                alpha = int(180 * (1 - (dist_from_center / 300)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
        elif align == 'top':
            for y in range(600):
                alpha = int(220 * (1 - (y / 600)))
                draw_ov.line([(0, y), (POST_SIZE[0], y)], fill=(0, 0, 0, alpha))
                
        bg = Image.alpha_composite(bg, overlay)
        
        draw = ImageDraw.Draw(bg)
        inset = 45
        draw.rectangle([inset, inset, POST_SIZE[0]-inset, POST_SIZE[1]-inset], outline=(255, 255, 255, 100), width=2)
        
        if align == 'bottom':
            start_y = POST_SIZE[1] - 300
        elif align == 'center':
            start_y = POST_SIZE[1] // 2 - 100
        elif align == 'top':
            start_y = 150
            
        # Draw Eng Text
        draw_text_center(draw, eng_text, start_y, font_small, fill=(210, 210, 210, 255), letter_spacing=15)
        
        # Draw Main Title
        draw_text_center(draw, main_title, start_y + 50, font_large, fill=(255, 255, 255, 255), letter_spacing=5)
        
        # Draw Subtitle
        draw_text_center(draw, subtitle, start_y + 180, font_medium, fill=(220, 200, 150, 255), letter_spacing=2)

        out_path = os.path.join(OUT_DIR, out_name)
        bg.convert("RGB").save(out_path, "JPEG", quality=95)
        print(f"Generated {out_path}")
        
    except Exception as e:
        print(f"Error processing {out_name}: {e}")

print("Generating Editorial Magazine Style Posts (Traditional Chinese, Actual Products)...")

posts = [
    # 1. Golden Pixiu
    ("cover_front.png", "post_01_editorial.jpg", "大自然的奇蹟", "天然金髮晶貔貅首選", "NATURAL GOLDEN QUARTZ", "bottom"),
    
    # 2. Golden Pixiu (Detail)
    ("detail_rutilated.png", "post_02_editorial.jpg", "毫不費力的高級感", "提升日常穿搭質感", "EFFORTLESS LUXURY", "bottom"),
    
    # 3. Alashan Zen
    ("alashan_cover.png", "post_03_editorial.jpg", "東方禪意美學", "阿拉善瑪瑙與奇楠沉香", "ORIENTAL ZEN AESTHETIC", "bottom"),
    
    # 4. Alashan Lifestyle
    ("alashan_incense_smoke.png", "post_04_editorial.jpg", "靜心凝神的力量", "成功者的底氣與氣場", "INNER PEACE", "bottom"),
    
    # 5. Strawberry Quartz Romance
    ("strawberry_cover.png", "post_05_editorial.jpg", "招桃花超靈能量", "草莓晶與粉晶的浪漫相遇", "STRAWBERRY QUARTZ", "bottom"),
    
    # 6. Strawberry Quartz Lifestyle
    ("strawberry_model_cafe.png", "post_06_editorial.jpg", "治癒系浪漫能量", "感受愛與被愛的喜悅", "HEALING ENERGY", "bottom"),
    
    # 7. Gift Box
    ("velvet_box.png", "post_07_editorial.jpg", "送禮的天花板", "專屬五行能量分析禮盒", "THE ULTIMATE GIFT", "bottom"),
    
    # 8. Report / Destiny (No custom made mention)
    ("alashan_vintage_paper.png", "post_08_editorial.jpg", "專屬命理能量水晶", "結合五行命理的精準建議", "FENG SHUI & DESTINY", "bottom"),
    
    # 9. Stacking / Trend
    ("wood_nature.png", "post_09_editorial.jpg", "回歸自然的美學", "展現獨特品味的配搭", "NATURAL AESTHETIC", "bottom"),
    
    # 10. Water / Cleansing
    ("strawberry_water_ripple.png", "post_10_editorial.jpg", "淨化專屬磁場", "告別水逆迎接全新好運", "PURE ENERGY CLEANSING", "center"),
]

for bg, out, title, sub, eng, align in posts:
    create_editorial_post(bg, out, title, sub, eng, align)

print("Done!")
