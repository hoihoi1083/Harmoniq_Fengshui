from PIL import Image
import os

folder = "/Users/michaelng/Desktop/marketing/黃水晶"
for f in os.listdir(folder):
    if f.endswith(".png"):
        path = os.path.join(folder, f)
        img = Image.open(path)
        print(f"{f}: {img.size}, mode={img.mode}")
