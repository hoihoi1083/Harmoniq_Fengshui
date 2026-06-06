#!/usr/bin/env python3
"""Process 閃金太陽石手串 reel: promotional text overlays + BGM (no voice)."""

import argparse
import math
import os
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from moviepy import AudioFileClip, VideoFileClip

WORKSPACE = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout"
DEFAULT_INPUT = "/Users/michaelng/Downloads/C1UgHqJpw8sKugX6HyDDM_video.mp4"
DEFAULT_OUTPUT = "/Users/michaelng/Desktop/marketing/reels_exports/sunstone_reel_bgm.mp4"
TEMP_SILENT = os.path.join(WORKSPACE, "tmp_video_frames", "sunstone_silent.mp4")
FONT_PATH = os.path.join(WORKSPACE, "assets", "fonts", "NotoSerifTC.ttf")
LOGO_PATH = os.path.join(WORKSPACE, "public", "images", "report", "bottom.png")
SR = 44100


def load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size)


def draw_text_with_stroke(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill=(255, 255, 255, 255),
    stroke_fill=(0, 0, 0, 255),
    stroke_width: int = 3,
):
    draw.text(
        xy,
        text,
        font=font,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke_fill,
    )


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_w: int) -> list[str]:
    lines = []
    for paragraph in text.split("\n"):
        current = ""
        for ch in paragraph:
            test = current + ch
            if draw.textbbox((0, 0), test, font=font)[2] <= max_w:
                current = test
            else:
                if current:
                    lines.append(current)
                current = ch
        if current:
            lines.append(current)
    return lines


def draw_overlays(
    frame_bgr: np.ndarray,
    *,
    title: str,
    tagline: str,
    bottom_caption: str,
    hook: str,
    show_hook: bool,
    real_shot_label: str,
    logo_img: Image.Image | None,
) -> np.ndarray:
    img = Image.fromarray(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = img.size

    title_font = load_font(max(40, int(w * 0.085)))
    tag_font = load_font(max(26, int(w * 0.048)))
    cap_font = load_font(max(24, int(w * 0.042)))
    hook_font = load_font(max(34, int(w * 0.072)))

    if show_hook and hook.strip():
        hook_lines = wrap_text(draw, hook, hook_font, int(w * 0.84))[:2]
        hook_h = draw.textbbox((0, 0), "測", font=hook_font)[3]
        hook_pad = 18
        hook_box_h = len(hook_lines) * hook_h + (len(hook_lines) - 1) * 8 + hook_pad * 2
        hook_box_w = int(w * 0.88)
        hook_x = (w - hook_box_w) // 2
        hook_y = int(h * 0.36) - hook_box_h // 2
        draw.rounded_rectangle(
            (hook_x, hook_y, hook_x + hook_box_w, hook_y + hook_box_h),
            radius=18,
            fill=(255, 248, 235, 245),
            outline=(180, 110, 40, 255),
            width=3,
        )
        hy = hook_y + hook_pad
        for line in hook_lines:
            tw = draw.textbbox((0, 0), line, font=hook_font)[2]
            draw_text_with_stroke(
                draw,
                ((w - tw) // 2, hy),
                line,
                hook_font,
                fill=(120, 55, 10, 255),
                stroke_fill=(255, 255, 255, 200),
                stroke_width=3,
            )
            hy += hook_h + 8

    title_lines = wrap_text(draw, title, title_font, int(w * 0.88))
    tag_lines = wrap_text(draw, tagline, tag_font, int(w * 0.88)) if tagline else []
    title_h = draw.textbbox((0, 0), "測", font=title_font)[3]
    tag_h = draw.textbbox((0, 0), "測", font=tag_font)[3]
    banner_pad = 14
    banner_h = (
        len(title_lines[:2]) * (title_h + 8)
        + len(tag_lines[:1]) * (tag_h + 6)
        + banner_pad * 2
        + (8 if tag_lines else 0)
    )
    banner_y = int(h * 0.11)
    draw.rounded_rectangle(
        (int(w * 0.04), banner_y, int(w * 0.96), banner_y + banner_h),
        radius=14,
        fill=(40, 20, 10, 175),
    )
    y = banner_y + banner_pad
    for line in title_lines[:2]:
        tw = draw.textbbox((0, 0), line, font=title_font)[2]
        draw_text_with_stroke(
            draw,
            ((w - tw) // 2, y),
            line,
            title_font,
            fill=(255, 200, 120, 255),
            stroke_fill=(60, 30, 10, 255),
            stroke_width=3,
        )
        y += title_h + 8
    for line in tag_lines[:1]:
        tw = draw.textbbox((0, 0), line, font=tag_font)[2]
        draw_text_with_stroke(
            draw,
            ((w - tw) // 2, y),
            line,
            tag_font,
            fill=(255, 245, 230, 255),
            stroke_fill=(40, 20, 10, 200),
            stroke_width=2,
        )
        y += tag_h + 6

    if real_shot_label.strip():
        badge_font = load_font(max(22, int(w * 0.038)))
        badge_text = real_shot_label.strip()
        bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pad_x, pad_y = 12, 8
        bx, by = int(w * 0.04), int(h * 0.17)
        draw.rounded_rectangle(
            (bx, by, bx + tw + pad_x * 2, by + th + pad_y * 2),
            radius=10,
            fill=(180, 30, 30, 230),
            outline=(255, 220, 180, 255),
            width=2,
        )
        draw_text_with_stroke(
            draw,
            (bx + pad_x, by + pad_y),
            badge_text,
            badge_font,
            fill=(255, 255, 255, 255),
            stroke_fill=(100, 10, 10, 255),
            stroke_width=2,
        )

    if bottom_caption.strip():
        cap_lines = wrap_text(draw, bottom_caption, cap_font, int(w * 0.86))
        cap_h = draw.textbbox((0, 0), "測", font=cap_font)[3]
        box_pad_y = 14
        box_h = len(cap_lines) * cap_h + (len(cap_lines) - 1) * 6 + box_pad_y * 2
        box_y = int(h * 0.74)
        draw.rounded_rectangle(
            (int(w * 0.05), box_y, int(w * 0.95), box_y + box_h),
            radius=12,
            fill=(255, 252, 245, 235),
            outline=(120, 70, 30, 255),
            width=2,
        )
        cy = box_y + box_pad_y
        for line in cap_lines:
            tw = draw.textbbox((0, 0), line, font=cap_font)[2]
            draw_text_with_stroke(
                draw,
                ((w - tw) // 2, cy),
                line,
                cap_font,
                fill=(50, 30, 15, 255),
                stroke_fill=(255, 255, 255, 140),
                stroke_width=2,
            )
            cy += cap_h + 6

    if logo_img:
        lw, lh = logo_img.size
        margin = 20
        img.paste(logo_img, (w - lw - margin, h - lh - margin), logo_img)

    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def _write_bgm_mp3(path: str, audio: np.ndarray, duration: float) -> None:
    t = np.linspace(0, duration, len(audio), endpoint=False)
    fade_in = np.minimum(1.0, t / 0.45)
    fade_out = np.minimum(1.0, (duration - t) / 0.9)
    audio = np.tanh(audio * fade_in * fade_out * 2.0) * 0.72
    wav_path = path.replace(".mp3", ".wav")
    from scipy.io import wavfile

    wavfile.write(wav_path, SR, (audio * 32767).astype(np.int16))
    subprocess.run(
        ["ffmpeg", "-y", "-i", wav_path, "-c:a", "libmp3lame", "-b:a", "192k", path],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if os.path.exists(wav_path):
        os.remove(wav_path)


def generate_sunstone_bgm_warm(path: str, duration: float) -> None:
    """Warm golden sunstone vibe: amber pads + soft sparkle plucks."""
    n = int(SR * duration)
    t = np.linspace(0, duration, n, endpoint=False)

    chords = [
        (146.83, 196.0, 246.94),
        (130.81, 164.81, 220.0),
        (174.61, 220.0, 293.66),
        (196.0, 246.94, 329.63),
    ]
    seg = duration / len(chords)
    pad = np.zeros(n)
    for i, (f1, f2, f3) in enumerate(chords):
        a = int(i * seg * SR)
        b = int((i + 1) * seg * SR) if i < len(chords) - 1 else n
        lt = t[a:b] - t[a]
        env = np.minimum(1.0, lt / 0.45) * np.minimum(1.0, (seg - lt) / 0.55)
        pad[a:b] += (
            0.075 * np.sin(2 * math.pi * f1 * lt)
            + 0.06 * np.sin(2 * math.pi * f2 * lt)
            + 0.045 * np.sin(2 * math.pi * f3 * lt)
        ) * env

    pluck_freqs = [392.0, 440.0, 493.88, 523.25, 587.33]
    pluck = np.zeros(n)
    step = int(0.75 * SR)
    idx = 0
    for start in range(int(0.25 * SR), n, step):
        f = pluck_freqs[idx % len(pluck_freqs)]
        idx += 1
        length = min(int(0.4 * SR), n - start)
        lt = np.arange(length) / SR
        pluck[start : start + length] += np.sin(2 * math.pi * f * lt) * np.exp(-lt * 5.5) * 0.08

    pulse = np.zeros(n)
    beat = int(1.0 * SR)
    for start in range(0, n, beat):
        length = min(int(0.08 * SR), n - start)
        lt = np.arange(length) / SR
        pulse[start : start + length] += np.sin(2 * math.pi * 98 * lt) * np.exp(-lt * 30) * 0.04

    _write_bgm_mp3(path, pad + pluck + pulse, duration)


def generate_sunstone_bgm_zen(path: str, duration: float) -> None:
    """Calm zen: slow pentatonic, no beat — good for lifestyle shots."""
    n = int(SR * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    pluck_freqs = [220.0, 246.94, 293.66, 329.63, 369.99, 440.0]
    pluck = np.zeros(n)
    step = int(0.9 * SR)
    idx = 0
    for start in range(int(0.35 * SR), n, step):
        f = pluck_freqs[idx % len(pluck_freqs)]
        idx += 1
        length = min(int(0.65 * SR), n - start)
        lt = np.arange(length) / SR
        pluck[start : start + length] += np.sin(2 * math.pi * f * lt) * np.exp(-lt * 3.5) * 0.09
    pad = (
        0.03 * np.sin(2 * math.pi * 110.0 * t)
        + 0.025 * np.sin(2 * math.pi * 164.81 * t)
    ) * (0.55 + 0.45 * np.sin(2 * math.pi * 0.07 * t))
    _write_bgm_mp3(path, pluck + pad, duration)


BGM_GENERATORS = {
    "warm": generate_sunstone_bgm_warm,
    "zen": generate_sunstone_bgm_zen,
}

BGM_DEFAULT_PATHS = {
    "warm": "/Users/michaelng/Desktop/marketing/reels_exports/sunstone_warm_bgm.mp3",
    "zen": "/Users/michaelng/Desktop/marketing/reels_exports/sunstone_zen_bgm.mp3",
}


def export_with_original_audio(
    video_path: str,
    source_path: str,
    output_path: str,
    duration: float,
    fps: float,
):
    silent = VideoFileClip(video_path)
    original = VideoFileClip(source_path)
    if original.audio is not None:
        audio = original.audio
        if audio.duration > duration:
            audio = audio.subclipped(0, duration)
        final = silent.with_audio(audio)
    else:
        final = silent
    final.write_videofile(
        output_path,
        codec="libx264",
        audio_codec="aac",
        fps=fps,
        preset="fast",
    )
    silent.close()
    original.close()
    final.close()


def attach_bgm(
    video_path: str,
    output_path: str,
    bgm_path: str,
    duration: float,
    fps: float,
    volume: float,
    bgm_style: str = "warm",
):
    if not os.path.exists(bgm_path):
        print(f"Generating BGM ({bgm_style}): {bgm_path}")
        os.makedirs(os.path.dirname(bgm_path), exist_ok=True)
        generator = BGM_GENERATORS.get(bgm_style, generate_sunstone_bgm_warm)
        generator(bgm_path, duration)

    silent = VideoFileClip(video_path)
    bgm = AudioFileClip(bgm_path).with_volume_scaled(volume)
    if bgm.duration > duration:
        bgm = bgm.subclipped(0, duration)
    else:
        bgm = bgm.with_duration(duration)

    final = silent.with_audio(bgm)
    final.write_videofile(
        output_path,
        codec="libx264",
        audio_codec="aac",
        fps=fps,
        preset="fast",
    )
    silent.close()
    bgm.close()
    final.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default=DEFAULT_INPUT)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    parser.add_argument("--title", default="閃金太陽石手串")
    parser.add_argument("--tagline", default="陽光一閃，溫暖如陽，")
    parser.add_argument("--hook", default="")
    parser.add_argument(
        "--hook-seconds",
        type=float,
        default=0,
        help="Show hook overlay for the first N seconds",
    )
    parser.add_argument(
        "--bottom-caption",
        default="陽光一照，金光閃閃\n隨單增送專屬報告，可DM查詢",
    )
    parser.add_argument(
        "--real-shot-label",
        default="",
        help='Badge e.g. "實物實拍" shown top-left for whole video',
    )
    parser.add_argument(
        "--keep-audio",
        action="store_true",
        help="Keep BGM/audio from input video instead of generating new BGM",
    )
    parser.add_argument("--bgm", default="")
    parser.add_argument(
        "--bgm-style",
        choices=["warm", "zen"],
        default="warm",
        help="warm=golden sparkle | zen=calm plucks",
    )
    parser.add_argument("--bgm-volume", type=float, default=0.36)
    parser.add_argument("--no-bottom-caption", action="store_true")
    args = parser.parse_args()

    if not args.bgm:
        args.bgm = BGM_DEFAULT_PATHS[args.bgm_style]

    if not os.path.exists(args.input):
        raise FileNotFoundError(f"Input video not found: {args.input}")

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    os.makedirs(os.path.dirname(TEMP_SILENT), exist_ok=True)

    bottom = "" if args.no_bottom_caption else args.bottom_caption

    logo_img = None
    if os.path.exists(LOGO_PATH):
        logo_img = Image.open(LOGO_PATH).convert("RGBA")
        tw = 70
        th = int(logo_img.size[1] * (tw / logo_img.size[0]))
        logo_img = logo_img.resize((tw, th), Image.Resampling.LANCZOS)

    cap = cv2.VideoCapture(args.input)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    writer = cv2.VideoWriter(
        TEMP_SILENT,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    frame_idx = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        t = frame_idx / fps
        writer.write(
            draw_overlays(
                frame,
                title=args.title,
                tagline=args.tagline,
                bottom_caption=bottom,
                hook=args.hook,
                show_hook=t < args.hook_seconds,
                real_shot_label=args.real_shot_label,
                logo_img=logo_img,
            )
        )
        frame_idx += 1

    frame_count = frame_idx
    cap.release()
    writer.release()
    duration = frame_count / fps if frame_count else 6.0

    if args.keep_audio:
        export_with_original_audio(
            TEMP_SILENT,
            args.input,
            args.output,
            duration,
            fps,
        )
    else:
        attach_bgm(
            TEMP_SILENT,
            args.output,
            args.bgm,
            duration,
            fps,
            args.bgm_volume,
            args.bgm_style,
        )
    print(f"Done: {args.output}")


if __name__ == "__main__":
    main()
