import os
import glob
from fontTools.ttLib import TTFont

def get_font_name(font_path):
    try:
        font = TTFont(font_path, fontNumber=0)
        name_record = font['name'].getDebugName(1)
        return name_record
    except:
        return None

fonts = glob.glob("/System/Library/Fonts/**/*.ttc", recursive=True) + \
        glob.glob("/System/Library/Fonts/**/*.ttf", recursive=True) + \
        glob.glob("/System/Library/Fonts/Supplemental/**/*.ttc", recursive=True) + \
        glob.glob("/System/Library/Fonts/Supplemental/**/*.ttf", recursive=True)

for f in fonts:
    name = get_font_name(f)
    if name:
        if any(keyword in name.lower() for keyword in ["kai", "xing", "wei", "li", "xingkai", "kaiti", "weibei"]):
            print(f"{name}: {f}")
