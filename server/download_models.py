import os
import urllib.request

files_to_download = [
    ("https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/mapping_00109-model.pth.tar", "SadTalker/checkpoints/mapping_00109-model.pth.tar"),
    ("https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/mapping_00229-model.pth.tar", "SadTalker/checkpoints/mapping_00229-model.pth.tar"),
    ("https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_256.safetensors", "SadTalker/checkpoints/SadTalker_V0.0.2_256.safetensors"),
    ("https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_512.safetensors", "SadTalker/checkpoints/SadTalker_V0.0.2_512.safetensors"),
    ("https://github.com/xinntao/facexlib/releases/download/v0.1.0/alignment_WFLW_4HG.pth", "SadTalker/gfpgan/weights/alignment_WFLW_4HG.pth"),
    ("https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth", "SadTalker/gfpgan/weights/detection_Resnet50_Final.pth"),
    ("https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth", "SadTalker/gfpgan/weights/GFPGANv1.4.pth"),
    ("https://github.com/xinntao/facexlib/releases/download/v0.2.2/parsing_parsenet.pth", "SadTalker/gfpgan/weights/parsing_parsenet.pth")
]

for url, dest in files_to_download:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if not os.path.exists(dest):
        print(f"Downloading {url} to {dest}...")
        try:
            urllib.request.urlretrieve(url, dest)
            print(f"Downloaded {dest}")
        except Exception as e:
            print(f"Failed to download {url}: {e}")
    else:
        print(f"Already exists: {dest}")

print("All downloads complete.")
