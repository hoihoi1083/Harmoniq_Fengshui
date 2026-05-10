from fontTools.ttLib import TTFont
import glob

fonts = glob.glob("/System/Library/Fonts/**/*.ttc", recursive=True) + glob.glob("/System/Library/Fonts/**/*.ttf", recursive=True) + glob.glob("/Library/Fonts/**/*.ttc", recursive=True) + glob.glob("/Library/Fonts/**/*.ttf", recursive=True)

for f in fonts:
    if "song" in f.lower() or "ming" in f.lower() or "serif" in f.lower():
        try:
            font = TTFont(f, fontNumber=0)
            if 'cmap' in font:
                cmap = font['cmap'].getcmap(3, 1).cmap
                if ord('靜') in cmap and ord('靈') in cmap:
                    print("Found TC support in:", f)
        except:
            pass
