import urllib.request
import os

# Download a free commercial-use Xingkai/Kaiti font (Ma Shan Zheng or similar from Google Fonts)
# Ma Shan Zheng is a beautiful Chinese calligraphy brush font
url = "https://github.com/google/fonts/raw/main/ofl/mashanzheng/MaShanZheng-Regular.ttf"
out_path = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/MaShanZheng-Regular.ttf"

print("Downloading font...")
urllib.request.urlretrieve(url, out_path)
print(f"Downloaded to {out_path}")

# Also let's get ZCOOL QingKe HuangYou (a beautiful elegant modern Chinese font)
url2 = "https://github.com/google/fonts/raw/main/ofl/zcoolqingkehuangyou/ZCOOLQingKeHuangYou-Regular.ttf"
out_path2 = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/ZCOOLQingKeHuangYou-Regular.ttf"
print("Downloading font 2...")
urllib.request.urlretrieve(url2, out_path2)
print(f"Downloaded to {out_path2}")

