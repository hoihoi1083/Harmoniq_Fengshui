from PIL import Image
import glob

for f in glob.glob("/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets/*.png"):
    try:
        img = Image.open(f)
        print(f"{f.split('/')[-1]}: {img.size}")
    except Exception as e:
        print(f"Error reading {f}: {e}")
