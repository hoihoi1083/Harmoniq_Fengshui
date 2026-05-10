import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/黑金超七方糖水晶_ad_material_20260507/TC"

font_path_tc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"

images_data = [
    {"file": "_____2026-05-07___5.40.29-80aa834c-e530-45c6-a260-89d125fe8a7c.png", "tc": ("頂級超七", "能量之王 · 磁場強大")},
    {"file": "_____2026-05-07___5.40.17-438d06db-7cc2-4776-89e8-5d39ed8c61ca.png", "tc": ("方糖點綴", "獨特品味 · 彰顯個性")},
    {"file": "_____2026-05-07___5.40.08-a4202f1c-872d-42e2-8be1-9f09ed4faa08.png", "tc": ("招財辟邪", "護身轉運 · 帶來好運")},
    {"file": "_____2026-05-07___5.40.13-641962ae-3d4b-49ad-810d-ed2368d8c115.png", "tc": ("晶體通透", "髮絲濃密 · 閃耀動人")},
    {"file": "_____2026-05-07___5.40.21-8fbd00c6-5499-411e-80f5-7eee08049fb0.png", "tc": ("匠心嚴選", "珍稀原礦 · 值得收藏")}
]

for idx, data in enumerate(images_data):
    img_path = os.path.join(ASSETS_DIR, data["file"])
    if not os.path.exists(img_path):
        print(f"Missing {img_path}")
        continue
    print(f"Found {img_path}")
    
    try:
        img = Image.open(img_path).convert("RGBA")
        print(f"Opened {img_path}")
        
        out_name = f"{idx+1:02d}_blackgold_superseven.png"
        out_path = os.path.join(OUT_DIR_TC, out_name)
        img.save(out_path, format="PNG")
        print(f"Saved {out_path}")
    except Exception as e:
        print(f"Error on {idx+1}: {e}")
