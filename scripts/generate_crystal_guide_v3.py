#!/usr/bin/env python3
"""Generate 20-crystal education carousel (4 slides × 5 crystals) — HarmoniQ v3 Light Design."""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/crystal_guide_v3_light_20260605"
FONT_PATH = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")

SIZE = (1080, 1350)

# Reference slides (user-provided) — bracelet crop centers derived from image size
REF_FILES = [
    ("_____2026-05-24___4.16.48-836484b1-c034-42b2-a724-40da26f45e94.png", (168, 196, 154)),
    ("_____2026-05-24___4.17.09-6692ee98-6903-4be0-a233-aaae1f38e86d.png", (120, 168, 210)),
    ("_____2026-05-24___4.16.42-4edd04bf-5173-4763-b0c5-2ac4b51202d0.png", (196, 168, 132)),
    ("_____2026-05-24___4.17.03-24f1bf25-9768-4df3-98e2-7cac4e9e97ab.png", (210, 168, 188)),
]

CROP_SIZE = 115

def ref_slide_meta(ref_file, accent):
    path = os.path.join(ASSETS_DIR, ref_file)
    w, h = Image.open(path).size
    return {
        "file": ref_file,
        "accent": accent,
        "crop_x": int(w * 0.385),
        "row_y": [
            int(h * 0.225),
            int(h * 0.405),
            int(h * 0.585),
            int(h * 0.765),
            int(h * 0.945),
        ],
    }

SLIDES = [
    [
        {
            "name": "白幽靈",
            "english": "White Phantom Quartz",
            "chakra": "太陽輪",
            "hand": "左右手皆可",
            "benefits": "淨化磁場、舒緩情緒、防爛桃花、改善睡眠",
            "accent": (180, 200, 170),
        },
        {
            "name": "紅紋石",
            "english": "Rhodochrosite",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "提升自信、改善異性緣、減負能量、增強行動力",
            "accent": (210, 120, 130),
        },
        {
            "name": "碧璽",
            "english": "Tourmaline",
            "chakra": "眉心輪",
            "hand": "戴左手",
            "benefits": "內外平衡、招福氣、舒緩情緒、提升女性魅力",
            "accent": (100, 160, 120),
        },
        {
            "name": "紅瑪瑙",
            "english": "Red Agate",
            "chakra": "臍輪",
            "hand": "戴左手",
            "benefits": "緩解壓力、消除負能量、改善失眠、增強免疫力",
            "accent": (190, 80, 60),
        },
        {
            "name": "太陽石",
            "english": "Sunstone",
            "chakra": "臍輪",
            "hand": "戴左手",
            "benefits": "緩解憂鬱、增強自信專注、改善人際關係",
            "accent": (220, 140, 60),
        },
    ],
    [
        {
            "name": "茶晶",
            "english": "Smoky Quartz",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "平衡情緒、吸收負能量、增強行動與分析力",
            "accent": (120, 90, 70),
        },
        {
            "name": "虎眼石",
            "english": "Tiger's Eye",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "調節情緒、招財、保持活力、增強自信與事業運",
            "accent": (160, 110, 40),
        },
        {
            "name": "紫鋰輝",
            "english": "Kunzite",
            "chakra": "頂輪",
            "hand": "戴左手",
            "benefits": "消除身心壓力、激發正能量、舒緩情緒、提升洞察力",
            "accent": (160, 130, 190),
        },
        {
            "name": "黑髮晶",
            "english": "Black Rutilated Quartz",
            "chakra": "海底輪",
            "hand": "戴右手",
            "benefits": "緩解壓力、淨化負能量、增領導魅力、助事業成功",
            "accent": (60, 60, 70),
        },
        {
            "name": "金髮晶",
            "english": "Gold Rutilated Quartz",
            "chakra": "海底輪",
            "hand": "戴右手",
            "benefits": "招財、消除負能量、增強行動力、安定心神",
            "accent": (190, 150, 50),
        },
    ],
    [
        {
            "name": "粉水晶",
            "english": "Rose Quartz",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "招桃花、旺人緣、增親和力、改善人際、舒緩煩躁",
            "accent": (210, 140, 160),
        },
        {
            "name": "海藍寶",
            "english": "Aquamarine",
            "chakra": "喉輪",
            "hand": "戴左手",
            "benefits": "增自信勇氣、提升溝通力、思維更清晰活躍",
            "accent": (90, 160, 190),
        },
        {
            "name": "黃水晶",
            "english": "Citrine",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "調節情緒、聚財、增自信、調節消化、調理腸胃",
            "accent": (220, 180, 60),
        },
        {
            "name": "紫水晶",
            "english": "Amethyst",
            "chakra": "眉心輪",
            "hand": "戴左手",
            "benefits": "提升記憶力、助學業、招貴人、增異性緣",
            "accent": (130, 90, 180),
        },
        {
            "name": "白水晶",
            "english": "Clear Quartz",
            "chakra": "頂輪",
            "hand": "戴左手",
            "benefits": "淨化磁場、增強記憶、集中注意力、提升學習工作效率",
            "accent": (180, 185, 195),
        },
    ],
    [
        {
            "name": "草莓晶",
            "english": "Strawberry Quartz",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "招正桃花、貴人緣、助學業、守護愛情、增進人緣",
            "accent": (200, 100, 120),
        },
        {
            "name": "石榴石",
            "english": "Garnet",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "改善氣血、增強免疫力、緩解壓力、改善腸胃功能",
            "accent": (130, 30, 40),
        },
        {
            "name": "月光石",
            "english": "Moonstone",
            "chakra": "頂輪",
            "hand": "戴左手",
            "benefits": "調節情緒、聚財、增自信、調節消化、調理腸胃",
            "accent": (160, 170, 190),
        },
        {
            "name": "綠幽靈",
            "english": "Green Phantom Quartz",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "招正財、提升事業、增個人自信、舒緩情緒",
            "accent": (70, 130, 90),
        },
        {
            "name": "金髮晶",
            "english": "Gold Rutilated Quartz",
            "chakra": "臍輪",
            "hand": "戴左手",
            "benefits": "增自信、提升旺氣、財旺鴻圖、提高行動力、有助健康",
            "accent": (190, 150, 50),
        },
    ],
]

def load_fonts():
    return {
        "title": ImageFont.truetype(FONT_PATH, 64),
        "subtitle": ImageFont.truetype(FONT_PATH, 26),
        "name": ImageFont.truetype(FONT_PATH, 38),
        "eng": ImageFont.truetype(FONT_PATH, 20),
        "badge": ImageFont.truetype(FONT_PATH, 20),
        "body": ImageFont.truetype(FONT_PATH, 24),
        "footer": ImageFont.truetype(FONT_PATH, 22),
        "slide": ImageFont.truetype(FONT_PATH, 22),
    }

def wrap_text(text, font, max_width, draw):
    lines = []
    current = ""
    for char in text:
        candidate = current + char
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines

def crop_bracelet(ref_path, cx, cy, size=CROP_SIZE):
    path = os.path.join(ASSETS_DIR, ref_path)
    img = Image.open(path).convert("RGBA")
    half = size // 2
    box = (cx - half, cy - half, cx + half, cy + half)
    crop = img.crop(box)
    return crop

def draw_gradient_bg(draw, w, h, top, bottom):
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

def make_circular(img, size):
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out

def make_bracelet_badge(bracelet_crop, accent_color, size=150):
    """Circular product photo with soft colored backing."""
    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    
    # Soft background circle using accent color with low opacity
    r, g, b = accent_color
    draw.ellipse((0, 0, size - 1, size - 1), fill=(r, g, b, 40))
    
    # Inner white circle
    inner_size = size - 16
    inner_offset = 8
    draw.ellipse((inner_offset, inner_offset, inner_offset + inner_size - 1, inner_offset + inner_size - 1), fill=(255, 255, 255, 255))
    
    # The bracelet
    inner = make_circular(bracelet_crop, inner_size - 10)
    badge.paste(inner, (inner_offset + 5, inner_offset + 5), inner)
    return badge

def draw_cover(fonts):
    img = Image.new("RGB", SIZE, (253, 251, 247))
    draw = ImageDraw.Draw(img)
    draw_gradient_bg(draw, SIZE[0], SIZE[1], (253, 251, 247), (244, 239, 230))

    # Decorative rings (Light theme)
    cx, cy = SIZE[0] // 2, 420
    for r, alpha in [(280, 40), (220, 60), (160, 80)]:
        ring = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.ellipse(
            (cx - r, cy - r, cx + r, cy + r),
            outline=(180, 160, 140, alpha),
            width=2,
        )
        img = Image.alpha_composite(img.convert("RGBA"), ring).convert("RGB")
        draw = ImageDraw.Draw(img)

    title = "20種常見水晶功效"
    tw = draw.textlength(title, font=fonts["title"])
    draw.text(((SIZE[0] - tw) / 2, 680), title, font=fonts["title"], fill=(44, 40, 37))

    sub = "HarmoniQ 水晶佩戴指南"
    sw = draw.textlength(sub, font=fonts["subtitle"])
    draw.text(((SIZE[0] - sw) / 2, 770), sub, font=fonts["subtitle"], fill=(140, 125, 105))

    hint = "滑動查看 · 每張介紹 5 種水晶"
    hw = draw.textlength(hint, font=fonts["body"])
    draw.text(((SIZE[0] - hw) / 2, 840), hint, font=fonts["body"], fill=(160, 150, 140))

    draw.line([(120, 940), (960, 940)], fill=(210, 200, 185, 150), width=1)
    footer = "harmoniqfengshui.com · 隨單贈八字報告"
    fw = draw.textlength(footer, font=fonts["footer"])
    draw.text(((SIZE[0] - fw) / 2, 980), footer, font=fonts["footer"], fill=(140, 130, 120))

    return img

def draw_slide(slide_idx, crystals, ref, fonts):
    img = Image.new("RGB", SIZE, (253, 251, 247))
    draw = ImageDraw.Draw(img)
    draw_gradient_bg(draw, SIZE[0], SIZE[1], (253, 251, 247), (244, 239, 230))

    # Header bar
    title = "20種常見水晶功效"
    draw.text((50, 52), title, font=fonts["title"], fill=(44, 40, 37))
    slide_label = f"{slide_idx + 1} / 4"
    lw = draw.textlength(slide_label, font=fonts["slide"])
    
    # Pill for slide number
    draw.rounded_rectangle([980 - lw - 20, 60, 1000, 100], radius=20, fill=(235, 225, 210))
    draw.text((990 - lw, 68), slide_label, font=fonts["slide"], fill=(100, 90, 80))

    card_top = 155
    card_h = 210
    gap = 14

    for i, crystal in enumerate(crystals):
        y = card_top + i * (card_h + gap)
        ca = crystal["accent"]

        # Card shadow layer (Soft, large blur)
        shadow = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.rounded_rectangle(
            [40, y + 10, 1040, y + card_h + 10],
            radius=24,
            fill=(0, 0, 0, 15),
        )
        shadow = shadow.filter(ImageFilter.GaussianBlur(10))
        img = Image.alpha_composite(img.convert("RGBA"), shadow).convert("RGB")
        draw = ImageDraw.Draw(img)

        # Card body (White)
        draw.rounded_rectangle(
            [40, y, 1040, y + card_h],
            radius=24,
            fill=(255, 255, 255),
        )
        
        # Right accent stripe
        draw.rounded_rectangle(
            [1024, y, 1040, y + card_h],
            radius=12,
            fill=ca,
        )
        # Fix left side of stripe to be flat
        draw.rectangle([1024, y, 1032, y + card_h], fill=ca)

        # Bracelet photo (Right side)
        bracelet = crop_bracelet(ref["file"], ref["crop_x"], ref["row_y"][i])
        badge = make_bracelet_badge(bracelet, ca, 160)
        img_rgba = img.convert("RGBA")
        img_rgba.paste(badge, (840, y + 25), badge)
        img = img_rgba.convert("RGB")
        draw = ImageDraw.Draw(img)

        # Names (Left side)
        draw.text((80, y + 30), crystal["name"], font=fonts["name"], fill=(44, 40, 37))
        draw.text((82, y + 75), crystal["english"], font=fonts["eng"], fill=(140, 130, 120))

        # Badges
        badge1 = f"{crystal['chakra']}"
        badge2 = crystal["hand"]
        bx = 80
        by = y + 115
        
        for badge_text, is_primary in [(badge1, True), (badge2, False)]:
            bw = draw.textlength(badge_text, font=fonts["badge"]) + 24
            if is_primary:
                fill_color = (ca[0], ca[1], ca[2], 40)
                text_color = (max(0, ca[0]-80), max(0, ca[1]-80), max(0, ca[2]-80))
            else:
                fill_color = (240, 235, 225, 255)
                text_color = (100, 90, 80)
                
            # Draw badge background
            badge_bg = Image.new("RGBA", SIZE, (0, 0, 0, 0))
            bd = ImageDraw.Draw(badge_bg)
            bd.rounded_rectangle([bx, by, bx + bw, by + 32], radius=12, fill=fill_color)
            img = Image.alpha_composite(img.convert("RGBA"), badge_bg).convert("RGB")
            draw = ImageDraw.Draw(img)
            
            draw.text((bx + 12, by + 4), badge_text, font=fonts["badge"], fill=text_color)
            bx += bw + 10

        # Benefits
        lines = wrap_text(crystal["benefits"], fonts["body"], 720, draw)
        ty = y + 160
        for line in lines[:2]:
            draw.text((80, ty), line, font=fonts["body"], fill=(92, 85, 77))
            ty += 30

    # Footer
    draw.line([(120, 1260), (960, 1260)], fill=(210, 200, 185, 150), width=1)
    footer = "harmoniqfengshui.com · 隨單贈專屬八字報告"
    fw = draw.textlength(footer, font=fonts["footer"])
    draw.text(((SIZE[0] - fw) / 2, 1280), footer, font=fonts["footer"], fill=(140, 130, 120))

    return img

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    fonts = load_fonts()

    cover = draw_cover(fonts)
    cover_path = os.path.join(OUT_DIR, "00_cover.jpg")
    cover.save(cover_path, quality=95)
    print(f"Saved {cover_path}")

    for idx, (crystals, (ref_file, accent)) in enumerate(zip(SLIDES, REF_FILES)):
        ref = ref_slide_meta(ref_file, accent)
        slide = draw_slide(idx, crystals, ref, fonts)
        out_path = os.path.join(OUT_DIR, f"slide_{idx + 1:02d}.jpg")
        slide.save(out_path, quality=95)
        print(f"Saved {out_path}")

    print(f"\nDone — {len(SLIDES) + 1} images in {OUT_DIR}")

if __name__ == "__main__":
    main()
