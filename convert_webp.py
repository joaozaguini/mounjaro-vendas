import os
from PIL import Image

def convert_to_webp(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')) and file.lower() != 'favicon.png':
                file_path = os.path.join(root, file)
                webp_path = os.path.splitext(file_path)[0] + '.webp'
                
                try:
                    with Image.open(file_path) as img:
                        # Convert image to RGB if it's RGBA (for jpg compatibility if needed)
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGB")
                        img.save(webp_path, "WEBP", quality=85)
                        print(f"Converted: {file} -> {os.path.basename(webp_path)}")
                except Exception as e:
                    print(f"Error converting {file}: {e}")

if __name__ == "__main__":
    convert_to_webp(r"C:\Users\joaoa\Desktop\Infos\Mounjaro\pagina_vendas\assets")
