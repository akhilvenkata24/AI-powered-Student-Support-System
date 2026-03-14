import os
import urllib.request

urls = [
    "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_256.safetensors",
    "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_512.safetensors",
]

checkpoint_dir = os.path.join(os.path.dirname(__file__), "server", "SadTalker", "checkpoints")
os.makedirs(checkpoint_dir, exist_ok=True)

for url in urls:
    filename = url.split("/")[-1]
    filepath = os.path.join(checkpoint_dir, filename)
    if not os.path.exists(filepath):
        print(f"Downloading {filename}...")
        urllib.request.urlretrieve(url, filepath)
        print(f"Finished {filename}")
    else:
        print(f"Already have {filename}")

print("Done downloading models.")
