import urllib.request
import os

url = "https://github.com/google/fonts/raw/main/ofl/zcoolxiaowei/ZCOOLXiaoWei-Regular.ttf"
out_path = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/ZCOOLXiaoWei-Regular.ttf"

print("Downloading XiaoWei (Brush/Kaiti style)...")
urllib.request.urlretrieve(url, out_path)
print(f"Downloaded to {out_path}")

url2 = "https://github.com/google/fonts/raw/main/ofl/longcang/LongCang-Regular.ttf"
out_path2 = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/LongCang-Regular.ttf"
print("Downloading LongCang (Calligraphy style)...")
urllib.request.urlretrieve(url2, out_path2)
print(f"Downloaded to {out_path2}")
