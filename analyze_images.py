import os
from PIL import Image, ImageStat

ASSETS_DIR = "/Users/michaelng/.cursor/projects/Users-michaelng-Desktop-HarmoniqFengShui-FengShuiLayout/assets"

images = [
    "new_report_1_dark.png", "new_report_2_wood.png", "new_report_3_silk.png", 
    "new_report_4_stone.png", "new_report_5_giftbox.png"
] + [f"marketing_girl_{i}.png" for i in range(1, 11)]

for img_name in images:
    path = os.path.join(ASSETS_DIR, img_name)
    if not os.path.exists(path):
        continue
    img = Image.open(path).convert("L") # Convert to grayscale
    w, h = img.size
    
    # Check left third and right third
    left_box = (0, 0, w//3, h)
    right_box = (w*2//3, 0, w, h)
    
    left_region = img.crop(left_box)
    right_region = img.crop(right_box)
    
    left_stat = ImageStat.Stat(left_region)
    right_stat = ImageStat.Stat(right_region)
    
    left_brightness = left_stat.mean[0]
    right_brightness = right_stat.mean[0]
    
    left_variance = left_stat.stddev[0]
    right_variance = right_stat.stddev[0]
    
    print(f"{img_name}:")
    print(f"  Left:  brightness={left_brightness:.1f}, stddev={left_variance:.1f}")
    print(f"  Right: brightness={right_brightness:.1f}, stddev={right_variance:.1f}")
    
