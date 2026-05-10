from fontTools.ttLib import TTFont
import sys

font_path = "/System/Library/Fonts/Supplemental/Songti.ttc"
try:
    # Songti.ttc is a collection. Let's just check the first font in the collection.
    font = TTFont(font_path, fontNumber=0)
    cmap = font['cmap'].getcmap(3, 1).cmap
    
    text_tc = "灰月光石 · 靜心靈性"
    text_sc = "灰月光石 · 静心灵性"
    
    print("TC:")
    for char in text_tc:
        if ord(char) in cmap:
            print(f"  {char}: YES")
        else:
            print(f"  {char}: NO")
            
    print("SC:")
    for char in text_sc:
        if ord(char) in cmap:
            print(f"  {char}: YES")
        else:
            print(f"  {char}: NO")
except Exception as e:
    print("Error:", e)
