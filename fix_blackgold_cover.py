import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
LOGO_PATH = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/public/images/report/bottom.png"
OUT_DIR_TC = "/Users/michaelng/Desktop/marketing/黑金超七方糖水晶_ad_material_20260507/TC"
OUT_DIR_SC = "/Users/michaelng/Desktop/marketing/黑金超七方糖水晶_ad_material_20260507/SC"

try:
    font_path_tc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"
    font_path_sc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"
except Exception as e:
    print("Font error:", e)

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

def draw_text_with_shadow(draw, position, text, font, fill, shadow_color=(0, 0, 0, 150)):
    x, y = position
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=fill)

def process_cover():
    # We will use one of the original product images as the cover instead of the abstract background
    # This image is very clean and shows the product perfectly
    img_path = os.path.join(ASSETS_DIR, "_____2026-05-07___5.40.29-80aa834c-e530-45c6-a260-89d125fe8a7c.png")
    if not os.path.exists(img_path):
        print("Cover source image not found")
        return
    
    for lang in ["tc", "sc"]:
        font_path = font_path_tc if lang == "tc" else font_path_sc
        # Make the font slightly smaller than the abstract cover so it fits nicely with the product
        font_title = ImageFont.truetype(font_path, 130)
        font_sub = ImageFont.truetype(font_path, 50)
        
        img = Image.open(img_path).convert("RGBA")
        img = ImageOps.fit(img, (1536, 1024), Image.Resampling.LANCZOS)
        
        # Add a subtle dark gradient from the left to make the text pop
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        draw_overlay = ImageDraw.Draw(overlay)
        
        w, h = img.size
        grad_width = w // 2
        for x in range(grad_width):
            alpha = int(180 * (1 - x/grad_width))
            draw_overlay.line([(x, 0), (x, h)], fill=(0, 0, 0, alpha))
            
        img = Image.alpha_composite(img, overlay)
        img = add_logo(img)
        draw = ImageDraw.Draw(img)
        
        title = "黑金超七"
        sub = "招財聚氣 · 方糖水晶" if lang == "tc" else "招财聚气 · 方糖水晶"
        
        gold_color = (212, 175, 55, 255)
        sub_color = (230, 210, 150, 255)
        shadow_color = (0, 0, 0, 180)
        
        # Draw vertically on the left side
        start_x = 150
        start_y = 120
        for char in title:
            draw_text_with_shadow(draw, (start_x, start_y), char, font_title, gold_color, shadow_color)
            start_y += 140
            
        start_y = 180
        sub_x = start_x - 80
        for char in sub:
            if char == '·' or char == ' ':
                start_y += 40
                continue
            draw_text_with_shadow(draw, (sub_x, start_y), char, font_sub, sub_color, shadow_color)
            start_y += 60
        
        out_dir = OUT_DIR_TC if lang == "tc" else OUT_DIR_SC
        out_path = os.path.join(out_dir, "00_blackgold_cover.png")
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved {out_path}")

process_cover()
print("Done updating cover image.")
