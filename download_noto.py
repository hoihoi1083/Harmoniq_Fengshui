import urllib.request
import os

os.makedirs("/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts", exist_ok=True)

url_sc = "https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf"
out_sc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifSC.ttf"

url_tc = "https://github.com/google/fonts/raw/main/ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf"
out_tc = "/Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout/assets/fonts/NotoSerifTC.ttf"

print("Downloading Noto Serif SC...")
try:
    urllib.request.urlretrieve(url_sc, out_sc)
    print("Downloaded SC")
except Exception as e:
    print("Error SC:", e)

print("Downloading Noto Serif TC...")
try:
    urllib.request.urlretrieve(url_tc, out_tc)
    print("Downloaded TC")
except Exception as e:
    print("Error TC:", e)
