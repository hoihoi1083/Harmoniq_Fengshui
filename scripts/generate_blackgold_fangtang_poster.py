#!/usr/bin/env python3
"""Luxury poster for 黑金超七方糖水晶 — concept-inspired layout, real product photo."""

import math
import os
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(
    os.path.expanduser("~"),
    ".cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets",
)
FONT_TC = os.path.join(WORKSPACE, "assets/fonts/NotoSerifTC.ttf")
LOGO_PATH = os.path.join(WORKSPACE, "public/images/report/bottom.png")
PRODUCT_PATH = os.path.join(
    ASSETS, "_____2026-05-07___5.40.17-438d06db-7cc2-4776-89e8-5d39ed8c61ca.png"
)

OUT_W, OUT_H = 1536, 1024
OUT_DESKTOP = os.path.expanduser("~/Desktop/黑金超七方糖水晶_海報_v1.png")
OUT_MARKETING = os.path.expanduser(
    "~/Desktop/marketing/黑金超七方糖水晶_ad_material_20260507/TC/00_blackgold_luxury_poster.png"
)

GOLD = (212, 175, 55)
GOLD_LIGHT = (235, 210, 140)
GOLD_DIM = (160, 130, 45)
WHITE = (245, 242, 235)
MUTED = (180, 175, 165)


def make_marble_bg(w: int, h: int, seed: int = 42) -> Image.Image:
    rng = random.Random(seed)
    base = Image.new("RGB", (w, h), (12, 12, 14))
    draw = ImageDraw.Draw(base)

    # soft gold vein curves
    for _ in range(18):
        x0 = rng.randint(-w // 4, w)
        y0 = rng.randint(-h // 4, h)
        pts = []
        cx, cy = x0, y0
        for _ in range(8):
            cx += rng.randint(80, 220)
            cy += rng.randint(-60, 60)
            pts.append((cx, cy))
        width = rng.randint(1, 3)
        alpha = rng.randint(35, 90)
        color = (GOLD[0], GOLD[1], GOLD[2])
        for i in range(len(pts) - 1):
            draw.line([pts[i], pts[i + 1]], fill=color, width=width)

    # noise texture
    noise = Image.effect_noise((w, h), 28).convert("L")
    noise = ImageOps.colorize(noise, (8, 8, 10), (35, 32, 28))
    base = Image.blend(base, noise, 0.22)

    # vignette
    vignette = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse([-w * 0.15, -h * 0.2, w * 1.15, h * 1.2], fill=210)
    vignette = vignette.filter(ImageFilter.GaussianBlur(120))
    dark = Image.new("RGB", (w, h), (0, 0, 0))
    base = Image.composite(base, dark, vignette)

    # spotlight on product side (right)
    spot = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(spot)
    sd.ellipse([w * 0.35, h * 0.05, w * 1.05, h * 0.95], fill=180)
    spot = spot.filter(ImageFilter.GaussianBlur(90))
    warm = Image.new("RGB", (w, h), (45, 38, 22))
    base = Image.composite(warm, base, spot)

    return base.convert("RGBA")


def remove_white_bg(im: Image.Image, threshold: int = 232) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            whiteness = min(r, g, b)
            if whiteness > threshold:
                px[x, y] = (r, g, b, 0)
            elif whiteness > 200:
                fade = (whiteness - 200) / max(threshold - 200, 1)
                new_a = int(a * (1 - fade))
                px[x, y] = (r, g, b, max(0, new_a))
    # despeckle faint white fringe
    cleaned = im.copy()
    cpx = cleaned.load()
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            r, g, b, a = cpx[x, y]
            if a > 0 and min(r, g, b) > 210:
                neighbors = [px[x + dx, y + dy][3] for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]]
                if sum(1 for n in neighbors if n == 0) >= 2:
                    cpx[x, y] = (r, g, b, 0)
    return cleaned


def add_product_shadow(product: Image.Image) -> Image.Image:
    w, h = product.size
    pad = 80
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))

    shadow = product.copy()
    shadow = ImageOps.colorize(shadow.convert("L"), (0, 0, 0), (0, 0, 0))
    shadow.putalpha(product.split()[3])
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    canvas.paste(shadow, (pad + 18, pad + 35), shadow)
    canvas.paste(product, (pad, pad), product)
    return canvas


def draw_icon_circle(draw, cx, cy, r, icon_type: str):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD, width=2)
    draw.ellipse([cx - r + 4, cy - r + 4, cx + r - 4, cy + r - 4], fill=(30, 28, 24, 200))
    if icon_type == "shield":
        draw.polygon(
            [(cx, cy - r * 0.45), (cx + r * 0.4, cy - r * 0.15), (cx + r * 0.35, cy + r * 0.35),
             (cx, cy + r * 0.5), (cx - r * 0.35, cy + r * 0.35), (cx - r * 0.4, cy - r * 0.15)],
            outline=GOLD_LIGHT, width=2,
        )
    elif icon_type == "diamond":
        draw.polygon(
            [(cx, cy - r * 0.5), (cx + r * 0.42, cy), (cx, cy + r * 0.5), (cx - r * 0.42, cy)],
            outline=GOLD_LIGHT, width=2,
        )
    else:  # energy
        for i in range(3):
            ang = math.pi / 2 + i * (2 * math.pi / 3)
            x2 = cx + math.cos(ang) * r * 0.42
            y2 = cy + math.sin(ang) * r * 0.42
            draw.line([(cx, cy), (x2, y2)], fill=GOLD_LIGHT, width=2)


def draw_text_shadow(draw, xy, text, font, fill, offset=2):
    x, y = xy
    draw.text((x + offset, y + offset), text, font=font, fill=(0, 0, 0, 160))
    draw.text((x, y), text, font=font, fill=fill)


def wrap_text(draw, text, font, max_width):
    lines = []
    current = ""
    for ch in text:
        test = current + ch
        if draw.textlength(test, font=font) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = ch
    if current:
        lines.append(current)
    return lines


def add_logo(img: Image.Image) -> Image.Image:
    if not os.path.exists(LOGO_PATH):
        return img
    logo = Image.open(LOGO_PATH).convert("RGBA")
    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = px[x, y]
            if r < 28 and g < 28 and b < 28:
                px[x, y] = (0, 0, 0, 0)
    lw = int(img.width * 0.07)
    lh = int(logo.height * (lw / logo.width))
    logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
    margin = int(img.width * 0.03)
    img.paste(logo, (img.width - lw - margin, img.height - lh - margin), logo)
    return img


def build_poster():
    bg = make_marble_bg(OUT_W, OUT_H)
    draw = ImageDraw.Draw(bg)

    font_title = ImageFont.truetype(FONT_TC, 88)
    font_sub = ImageFont.truetype(FONT_TC, 36)
    font_body = ImageFont.truetype(FONT_TC, 26)
    font_feat_title = ImageFont.truetype(FONT_TC, 28)
    font_feat_sub = ImageFont.truetype(FONT_TC, 20)
    font_box_title = ImageFont.truetype(FONT_TC, 24)
    font_box_body = ImageFont.truetype(FONT_TC, 20)
    font_chip = ImageFont.truetype(FONT_TC, 18)

    left_x = 72
    y = 58

    draw_text_shadow(draw, (left_x, y), "黑金超七", font_title, GOLD)
    y += 100
    draw_text_shadow(draw, (left_x, y), "方糖水晶", font_title, GOLD_LIGHT)
    y += 88
    draw_text_shadow(draw, (left_x, y), "能量  ×  財富  ×  守護", font_sub, GOLD_DIM)
    y += 58

    desc = (
        "深色基底結合金色光感，方糖切工晶體通透耀眼。"
        "強化招財聚氣與事業氣場，助你在重要場合自信出場。"
    )
    for line in wrap_text(draw, desc, font_body, 520):
        draw.text((left_x, y), line, font=font_body, fill=MUTED)
        y += 34

    y += 28
    features = [
        ("shield", "極致守護", "穩定磁場 · 阻隔負能量"),
        ("diamond", "招財聚氣", "聚焦財運 · 資源整合"),
        ("energy", "氣場提振", "職場自信 · 形象加分"),
    ]
    for icon, title, sub in features:
        draw_icon_circle(draw, left_x + 28, y + 28, 28, icon)
        draw_text_shadow(draw, (left_x + 72, y + 4), title, font_feat_title, GOLD_LIGHT)
        draw.text((left_x + 72, y + 38), sub, font=font_feat_sub, fill=MUTED)
        y += 82

    # audience box
    box_y = OUT_H - 200
    draw.rounded_rectangle(
        [left_x, box_y, left_x + 500, box_y + 120],
        radius=14,
        outline=GOLD_DIM,
        width=1,
        fill=(20, 18, 16, 180),
    )
    draw_text_shadow(draw, (left_x + 20, box_y + 14), "適合族群", font_box_title, GOLD)
    audience = "追求事業突破 · 重視財運與形象 · 需要能量加持的你"
    for i, line in enumerate(wrap_text(draw, audience, font_box_body, 460)):
        draw.text((left_x + 20, box_y + 48 + i * 26), line, font=font_box_body, fill=WHITE)

    # bottom material chips
    chips = [
        ("黑金超七", "招財 × 提升"),
        ("方糖切工", "獨特 × 亮眼"),
        ("金屬配飾", "尊貴 × 奢華"),
    ]
    chip_x = OUT_W // 2 - 120
    chip_y = OUT_H - 95
    for label, sub in chips:
        draw.rounded_rectangle(
            [chip_x, chip_y, chip_x + 155, chip_y + 58],
            radius=10,
            outline=GOLD_DIM,
            width=1,
            fill=(25, 22, 18, 200),
        )
        tw = draw.textlength(label, font=font_chip)
        draw.text((chip_x + (155 - tw) / 2, chip_y + 8), label, font=font_chip, fill=GOLD_LIGHT)
        sw = draw.textlength(sub, font=font_chip)
        draw.text((chip_x + (155 - sw) / 2, chip_y + 30), sub, font=font_chip, fill=MUTED)
        chip_x += 175

    # ground glow under product (behind bracelet only)
    glow = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gx, gy = int(OUT_W * 0.62), int(OUT_H * 0.72)
    gd.ellipse([gx - 280, gy - 40, gx + 280, gy + 40], fill=(212, 175, 55, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(25))
    bg = Image.alpha_composite(bg, glow)

    # product composite
    product = Image.open(PRODUCT_PATH)
    product = remove_white_bg(product)
    target_h = int(OUT_H * 0.82)
    ratio = target_h / product.height
    product = product.resize((int(product.width * ratio), target_h), Image.Resampling.LANCZOS)
    product = product.rotate(-6, resample=Image.Resampling.BICUBIC, expand=True)
    product = add_product_shadow(product)

    px = OUT_W - product.width - 40
    py = (OUT_H - product.height) // 2 + 10
    bg.paste(product, (px, py), product)

    # reflection
    refl = product.copy().transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    refl = refl.filter(ImageFilter.GaussianBlur(6))
    rpx = refl.load()
    rw, rh = refl.size
    for y in range(rh):
        for x in range(rw):
            r, g, b, a = rpx[x, y]
            fade = int(a * max(0, 0.35 - (y / rh) * 0.35))
            rpx[x, y] = (r, g, b, fade)
    bg.paste(refl, (px, py + product.height - 30), refl)

    bg = add_logo(bg)
    return bg.convert("RGB")


def main():
    os.makedirs(os.path.dirname(OUT_MARKETING), exist_ok=True)
    poster = build_poster()
    poster.save(OUT_DESKTOP, quality=95)
    poster.save(OUT_MARKETING, quality=95)
    print(f"Saved: {OUT_DESKTOP}")
    print(f"Saved: {OUT_MARKETING}")


if __name__ == "__main__":
    main()
