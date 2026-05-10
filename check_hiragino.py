from fontTools.ttLib import TTFont

f = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc"
try:
    font = TTFont(f, fontNumber=0)
    cmap = font['cmap'].getcmap(3, 1).cmap
    print("Hiragino Mincho ProN:")
    for char in "灰月光石 · 靜心靈性静心灵性":
        if ord(char) in cmap:
            print(f"  {char}: YES")
        else:
            print(f"  {char}: NO")
except Exception as e:
    print("Error:", e)
