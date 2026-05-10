import os
from PIL import Image, ImageDraw, ImageFont

# Paths
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/marketing-harmoniq/灰月光石_tc"
OUT_DIR_SC = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/marketing-harmoniq/灰月光石_sc"

os.makedirs(OUT_DIR_TC, exist_ok=True)
os.makedirs(OUT_DIR_SC, exist_ok=True)

# Fonts
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Songti.ttc", 80)
    font_sub = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 40)
except Exception as e:
    print("Font error:", e)
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()

# Texts for the 10 images
marketing_texts = {
    "tc": [
        ("灰月光石", "靜謐之美 · 守護心靈"),
        ("灰月光石", "柔和藍光 · 喚醒直覺"),
        ("灰月光石", "禪意生活 · 平靜安寧"),
        ("灰月光石", "專屬解讀 · 能量指引"),
        ("灰月光石", "絲滑觸感 · 溫潤如玉"),
        ("灰月光石", "完美好禮 · 傳遞心意"),
        ("灰月光石", "自然共鳴 · 淨化磁場"),
        ("灰月光石", "自信優雅 · 職場守護"),
        ("灰月光石", "深度冥想 · 靈性提升"),
        ("灰月光石", "極致美學 · 時尚百搭")
    ],
    "sc": [
        ("灰月光石", "静谧之美 · 守护心灵"),
        ("灰月光石", "柔和蓝光 · 唤醒直觉"),
        ("灰月光石", "禅意生活 · 平静安宁"),
        ("灰月光石", "专属解读 · 能量指引"),
        ("灰月光石", "丝滑触感 · 温润如玉"),
        ("灰月光石", "完美好礼 · 传递心意"),
        ("灰月光石", "自然共鸣 · 净化磁场"),
        ("灰月光石", "自信优雅 · 职场守护"),
        ("灰月光石", "深度冥想 · 灵性提升"),
        ("灰月光石", "极致美学 · 时尚百搭")
    ]
}

def add_logo(img):
    try:
        logo = Image.open(LOGO_PATH).convert("RGBA")
        px = logo.load()
        w, h = logo.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if r < 28 and g < 28 and b < 28:
                    px[x, y] = (0, 0, 0, 0)
        
        lw = int(img.width * 0.092)
        ratio = lw / logo.width
        lh = int(logo.height * ratio)
        logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
        
        margin_x = int(img.width * 0.032)
        margin_y = int(img.height * 0.032)
        x = img.width - lw - margin_x
        y = img.height - lh - margin_y
        
        img.paste(logo, (x, y), logo)
    except Exception as e:
        print("Logo error:", e)
    return img

def process_marketing_image(idx, lang):
    img_path = os.path.join(ASSETS_DIR, f"marketing_girl_{idx+1}.png")
    if not os.path.exists(img_path):
        print(f"Missing {img_path}")
        return
        
    try:
        img = Image.open(img_path).convert("RGBA")
        img = img.resize((1536, 1024), Image.Resampling.LANCZOS)
        img = add_logo(img)
        
        draw = ImageDraw.Draw(img)
        title, sub = marketing_texts[lang][idx]
        
        # Add a subtle dark gradient/shadow behind text for readability
        # (Optional, but helps with light images)
        
        draw.text((100, 100), title, font=font_title, fill=(255, 255, 255, 255))
        draw.text((100, 200), sub, font=font_sub, fill=(230, 230, 230, 255))
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_name = f"{idx+1:02d}_marketing_social.png"
        out_path = os.path.join(out_dir, out_name)
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved {out_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

for i in range(10):
    process_marketing_image(i, "tc")
    process_marketing_image(i, "sc")

print("Done processing all 10 marketing images.")
