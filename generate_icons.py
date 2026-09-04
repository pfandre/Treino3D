import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, output_path):
    # Dark background
    img = Image.new('RGBA', (size, size), color=(10, 13, 20, 255))
    draw = ImageDraw.Draw(img)
    
    # Red accent circle
    padding = size * 0.15
    draw.ellipse([padding, padding, size - padding, size - padding], fill=(18, 24, 38, 255), outline=(225, 29, 72, 255), width=max(2, int(size * 0.02)))
    
    # Text "T" in the center
    # Fallback to default font if we don't have a good one
    try:
        # Try a standard system font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size * 0.4))
    except:
        font = ImageFont.load_default()
    
    text = "T3D"
    
    # Get bounding box using the modern textbbox method
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older Pillow versions
        text_w, text_h = draw.textsize(text, font=font)

    # Draw centered text
    draw.text(((size - text_w) / 2, (size - text_h) / 2 - (size*0.05)), text, font=font, fill=(225, 29, 72, 255))
    
    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)

print("Generating 192x192 icon...")
create_icon(192, "/home/andrepeixoto/.gemini/antigravity-ide/scratch/Projeto de Vendas/Treino3D/assets/icons/icon-192x192.png")
print("Generating 512x512 icon...")
create_icon(512, "/home/andrepeixoto/.gemini/antigravity-ide/scratch/Projeto de Vendas/Treino3D/assets/icons/icon-512x512.png")
print("Done!")
