#!/usr/bin/env python3
"""Composite public/images/report/bottom.png onto harmoniq-social-*.png.

Placement: bottom-right corner, small signature style — avoids covering steps,
headlines, and product areas (not bottom-center).

Always composites FROM _backup_before_logo when present so re-runs do not stack
logos. Seed that folder once with clean exports if missing.

Usage from repo root:
  ./.venv-marketing/bin/python scripts/apply_report_logo_to_social_images.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = ROOT / "public/images/report/bottom.png"
MARKET_DIR = ROOT / "public/marketing-harmoniq"
BACKUP_DIR = MARKET_DIR / "_backup_before_logo"
# Smaller than before; corner placement so main art stays readable
LOGO_WIDTH_RATIO = 0.092
# Inset from right and bottom edges (fraction of image width / height)
MARGIN_X_RATIO = 0.032
MARGIN_Y_RATIO = 0.032


def knock_out_black_for_alpha(im: Image.Image) -> Image.Image:
    """Make near-black pixels transparent so seal sits cleanly on light backgrounds."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r < 28 and g < 28 and b < 28:
                px[x, y] = (0, 0, 0, 0)
    return im


def resolve_source(out_path: Path) -> Path:
    """Prefer clean backup; never overwrite backup from this script."""
    backup_file = BACKUP_DIR / out_path.name
    if backup_file.exists():
        return backup_file
    print(
        f"WARN: missing {backup_file.name} in _backup_before_logo — "
        f"using current file (may already contain a pasted logo).",
    )
    return out_path


def main() -> None:
    logo_src = knock_out_black_for_alpha(Image.open(LOGO_PATH).convert("RGBA"))

    targets = sorted(MARKET_DIR.glob("harmoniq-social-*.png"))
    if not targets:
        raise SystemExit(f"No harmoniq-social-*.png in {MARKET_DIR}")

    for out_path in targets:
        src_path = resolve_source(out_path)
        base = Image.open(src_path).convert("RGBA")
        bw, bh = base.size

        lw = max(28, int(bw * LOGO_WIDTH_RATIO))
        ratio = lw / logo_src.width
        lh = max(1, int(logo_src.height * ratio))
        logo = logo_src.resize((lw, lh), Image.Resampling.LANCZOS)

        margin_x = max(8, int(bw * MARGIN_X_RATIO))
        margin_y = max(8, int(bh * MARGIN_Y_RATIO))
        x = bw - lw - margin_x
        y = bh - lh - margin_y

        out = Image.new("RGBA", (bw, bh))
        out.paste(base, (0, 0))
        out.paste(logo, (x, y), logo)
        out.save(out_path, format="PNG", optimize=True)
        print(f"OK {out_path.name} logo {lw}x{lh} @ bottom-right ({x},{y})")

    print("Done. Official seal uses public/images/report/bottom.png (corner mark).")


if __name__ == "__main__":
    main()
