#!/usr/bin/env python3
"""Generate 20-crystal education carousel (4 slides × 5 crystals) — HarmoniQ v2 design."""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"
OUT_DIR = "/Users/michaelng/Desktop/marketing/crystal_guide_v2_20260605"
FONT_PATH = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")

SIZE = (1080, 1350)

# Reference slides (user-provided) — bracelet crop centers derived from image size
REF_FILES = [
    ("_____2026-05-24___4.16.48-f2d72988-637b-4dac-8247-3b2c33ba3168.png", (168, 196, 154)),
    ("_____2026-05-24___4.17.09-78909320-2dd4-4ce8-a0bd-12e04963f8c4.png", (120, 168, 210)),
    ("_____2026-05-24___4.16.42-73ac6c6d-ce44-4f08-9b68-3055698ba34a.png", (196, 168, 132)),
    ("_____2026-05-24___4.17.03-af056a32-2324-4661-9b37-2b01b2beb471.png", (210, 168, 188)),
]

CROP_SIZE = 108


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
            "accent": (220, 230, 210),
        },
        {
            "name": "紅紋石",
            "english": "Rhodochrosite",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "提升自信、改善異性緣、減負能量、增強行動力",
            "accent": (230, 150, 160),
        },
        {
            "name": "碧璽",
            "english": "Tourmaline",
            "chakra": "眉心輪",
            "hand": "戴左手",
            "benefits": "內外平衡、招福氣、舒緩情緒、提升女性魅力",
            "accent": (140, 190, 150),
        },
        {
            "name": "紅瑪瑙",
            "english": "Red Agate",
            "chakra": "臍輪",
            "hand": "戴左手",
            "benefits": "緩解壓力、消除負能量、改善失眠、增強免疫力",
            "accent": (210, 110, 90),
        },
        {
            "name": "太陽石",
            "english": "Sunstone",
            "chakra": "臍輪",
            "hand": "戴左手",
            "benefits": "緩解憂鬱、增強自信專注、改善人際關係",
            "accent": (230, 170, 90),
        },
    ],
    [
        {
            "name": "茶晶",
            "english": "Smoky Quartz",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "平衡情緒、吸收負能量、增強行動與分析力",
            "accent": (150, 120, 100),
        },
        {
            "name": "虎眼石",
            "english": "Tiger's Eye",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "調節情緒、招財、保持活力、增強自信與事業運",
            "accent": (180, 140, 70),
        },
        {
            "name": "紫鋰輝",
            "english": "Kunzite",
            "chakra": "頂輪",
            "hand": "戴左手",
            "benefits": "消除身心壓力、激發正能量、舒緩情緒、提升洞察力",
            "accent": (190, 160, 210),
        },
        {
            "name": "黑髮晶",
            "english": "Black Rutilated Quartz",
            "chakra": "海底輪",
            "hand": "戴右手",
            "benefits": "緩解壓力、淨化負能量、增領導魅力、助事業成功",
            "accent": (80, 80, 90),
        },
        {
            "name": "金髮晶",
            "english": "Gold Rutilated Quartz",
            "chakra": "海底輪",
            "hand": "戴右手",
            "benefits": "招財、消除負能量、增強行動力、安定心神",
            "accent": (210, 180, 80),
        },
    ],
    [
        {
            "name": "粉水晶",
            "english": "Rose Quartz",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "招桃花、旺人緣、增親和力、改善人際、舒緩煩躁",
            "accent": (230, 170, 190),
        },
        {
            "name": "海藍寶",
            "english": "Aquamarine",
            "chakra": "喉輪",
            "hand": "戴左手",
            "benefits": "增自信勇氣、提升溝通力、思維更清晰活躍",
            "accent": (120, 190, 210),
        },
        {
            "name": "黃水晶",
            "english": "Citrine",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "調節情緒、聚財、增自信、調節消化、調理腸胃",
            "accent": (230, 200, 90),
        },
        {
            "name": "紫水晶",
            "english": "Amethyst",
            "chakra": "眉心輪",
            "hand": "戴左手",
            "benefits": "提升記憶力、助學業、招貴人、增異性緣",
            "accent": (160, 120, 200),
        },
        {
            "name": "白水晶",
            "english": "Clear Quartz",
            "chakra": "頂輪",
            "hand": "戴左手",
            "benefits": "淨化磁場、增強記憶、集中注意力、提升學習工作效率",
            "accent": (210, 215, 225),
        },
    ],
    [
        {
            "name": "草莓晶",
            "english": "Strawberry Quartz",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "招正桃花、貴人緣、助學業、守護愛情、增進人緣",
            "accent": (220, 130, 150),
        },
        {
            "name": "石榴石",
            "english": "Garnet",
            "chakra": "海底輪",
            "hand": "戴左手",
            "benefits": "改善氣血、增強免疫力、緩解壓力、改善腸胃功能",
            "accent": (160, 50, 60),
        },
        {
            "name": "月光石",
            "english": "Moonstone",
            "chakra": "頂輪",
            "hand": "戴左手",
            "benefits": "調節情緒、聚財、增自信、調節消化、調理腸胃",
            "accent": (190, 200, 220),
        },
        {
            "name": "綠幽靈",
            "english": "Green Phantom Quartz",
            "chakra": "心輪",
            "hand": "戴左手",
            "benefits": "招正財、提升事業、增個人自信、舒緩情緒",
            "accent": (90, 160, 110),
        },
        {
            "name": "金髮晶",
            "english": "Gold Rutilated Quartz",
            "chakra": "臍輪",
            "hand": "戴左手",
            "benefits": "增自信、提升旺氣、財旺鴻圖、提高行動力、有助健康",
            "accent": (210, 180, 80),
        },
    ],
]


def load_fonts():
    return {
        "title": ImageFont.truetype(FONT_PATH, 58),
        "subtitle": ImageFont.truetype(FONT_PATH, 24),
        "name": ImageFont.truetype(FONT_PATH, 34),
        "eng": ImageFont.truetype(FONT_PATH, 18),
        "badge": ImageFont.truetype(FONT_PATH, 20),
        "body": ImageFont.truetype(FONT_PATH, 22),
        "footer": ImageFont.truetype(FONT_PATH, 22),
        "slide": ImageFont.truetype(FONT_PATH, 20),
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


def make_bracelet_badge(bracelet_crop, size=130):
    """Circular product photo on cream backing — hides stray text from source crop."""
    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    draw.ellipse((0, 0, size - 1, size - 1), fill=(248, 244, 236, 255))
    inner = make_circular(bracelet_crop, size - 20)
    badge.paste(inner, (10, 10), inner)
    return badge


def draw_cover(fonts):
    img = Image.new("RGB", SIZE, (18, 22, 32))
    draw = ImageDraw.Draw(img)
    draw_gradient_bg(draw, SIZE[0], SIZE[1], (28, 36, 52), (12, 14, 22))

    # Decorative rings
    cx, cy = SIZE[0] // 2, 420
    for r, alpha in [(280, 30), (220, 45), (160, 60)]:
        ring = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.ellipse(
            (cx - r, cy - r, cx + r, cy + r),
            outline=(212, 175, 110, alpha),
            width=2,
        )
        img = Image.alpha_composite(img.convert("RGBA"), ring).convert("RGB")
        draw = ImageDraw.Draw(img)

    title = "20種常見水晶功效"
    tw = draw.textlength(title, font=fonts["title"])
    draw.text(((SIZE[0] - tw) / 2, 680), title, font=fonts["title"], fill=(245, 240, 230))

    sub = "HarmoniQ 水晶佩戴指南"
    sw = draw.textlength(sub, font=fonts["subtitle"])
    draw.text(((SIZE[0] - sw) / 2, 760), sub, font=fonts["subtitle"], fill=(212, 175, 110))

    hint = "滑動查看 · 每張介紹 5 種水晶"
    hw = draw.textlength(hint, font=fonts["body"])
    draw.text(((SIZE[0] - hw) / 2, 830), hint, font=fonts["body"], fill=(180, 185, 195))

    draw.line([(120, 920), (960, 920)], fill=(212, 175, 110, 120), width=1)
    footer = "harmoniqfengshui.com · 隨單贈八字報告"
    fw = draw.textlength(footer, font=fonts["footer"])
    draw.text(((SIZE[0] - fw) / 2, 960), footer, font=fonts["footer"], fill=(140, 145, 155))

    return img


def draw_slide(slide_idx, crystals, ref, fonts):
    img = Image.new("RGB", SIZE, (18, 22, 32))
    draw = ImageDraw.Draw(img)
    draw_gradient_bg(draw, SIZE[0], SIZE[1], (24, 30, 44), (14, 16, 24))

    # Header bar
    draw.rounded_rectangle([40, 36, 1040, 130], radius=18, fill=(32, 38, 54), outline=(212, 175, 110), width=1)
    title = "20種常見水晶功效"
    draw.text((70, 52), title, font=fonts["title"], fill=(245, 240, 230))
    slide_label = f"{slide_idx + 1} / 4"
    lw = draw.textlength(slide_label, font=fonts["slide"])
    draw.text((980 - lw, 68), slide_label, font=fonts["slide"], fill=(212, 175, 110))

    accent = ref["accent"]
    card_top = 155
    card_h = 210
    gap = 12

    for i, crystal in enumerate(crystals):
        y = card_top + i * (card_h + gap)
        ca = crystal["accent"]

        # Card shadow layer
        shadow = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.rounded_rectangle(
            [52, y + 6, 1028, y + card_h + 6],
            radius=16,
            fill=(0, 0, 0, 70),
        )
        img = Image.alpha_composite(img.convert("RGBA"), shadow).convert("RGB")
        draw = ImageDraw.Draw(img)

        # Card body
        draw.rounded_rectangle(
            [48, y, 1024, y + card_h],
            radius=16,
            fill=(36, 42, 58),
            outline=(70, 78, 98),
            width=1,
        )
        # Left accent stripe
        draw.rounded_rectangle(
            [48, y, 58, y + card_h],
            radius=8,
            fill=ca,
        )

        # Bracelet photo
        bracelet = crop_bracelet(ref["file"], ref["crop_x"], ref["row_y"][i])
        circle = make_bracelet_badge(bracelet, 130)
        ring = Image.new("RGBA", (146, 146), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.ellipse((0, 0, 145, 145), outline=(212, 175, 110), width=3)
        rd.ellipse((6, 6, 139, 139), outline=(255, 255, 255, 80), width=1)
        img_rgba = img.convert("RGBA")
        img_rgba.paste(ring, (78, y + 32), ring)
        img_rgba.paste(circle, (86, y + 40), circle)
        img = img_rgba.convert("RGB")
        draw = ImageDraw.Draw(img)

        # Names
        draw.text((240, y + 28), crystal["name"], font=fonts["name"], fill=(245, 240, 230))
        draw.text((242, y + 68), crystal["english"], font=fonts["eng"], fill=(160, 165, 175))

        # Badges
        badge1 = f"{crystal['chakra']}"
        badge2 = crystal["hand"]
        bx = 240
        by = y + 98
        for badge_text, fill in [(badge1, (212, 175, 110)), (badge2, (90, 110, 140))]:
            bw = draw.textlength(badge_text, font=fonts["badge"]) + 24
            draw.rounded_rectangle([bx, by, bx + bw, by + 32], radius=12, fill=fill)
            draw.text((bx + 12, by + 5), badge_text, font=fonts["badge"], fill=(255, 255, 255))
            bx += bw + 10

        # Benefits
        lines = wrap_text(crystal["benefits"], fonts["body"], 720, draw)
        ty = y + 142
        for line in lines[:2]:
            draw.text((240, ty), line, font=fonts["body"], fill=(200, 205, 215))
            ty += 28

    # Footer
    draw.rounded_rectangle([40, 1260, 1040, 1310], radius=14, fill=(28, 34, 48))
    footer = "harmoniqfengshui.com · 隨單贈專屬八字報告"
    fw = draw.textlength(footer, font=fonts["footer"])
    draw.text(((SIZE[0] - fw) / 2, 1275), footer, font=fonts["footer"], fill=(212, 175, 110))

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
