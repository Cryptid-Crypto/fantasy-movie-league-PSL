#!/usr/bin/env python3.11
"""
Add PSL Bunny Logo to Portrait
Composites the official PSL bunny logo onto a portrait's clothing area
"""

from PIL import Image
import sys
import os

def add_psl_logo_to_portrait(portrait_path, logo_path, output_path, logo_size=200, logo_position=None):
    """
    Add PSL logo to portrait on the clothing area.
    
    Args:
        portrait_path: Path to portrait image
        logo_path: Path to PSL bunny logo
        output_path: Where to save result
        logo_size: Size of logo in pixels (default 200)
        logo_position: Tuple (x, y) for logo center, or None for auto-center on chest
    """
    # Load portrait
    portrait = Image.open(portrait_path).convert('RGBA')
    
    # Load and resize logo
    logo = Image.open(logo_path).convert('RGBA')
    
    # Convert logo to white if it's black
    # (Ryan Connor has WHITE logo on black clothing)
    logo_data = logo.getdata()
    new_logo_data = []
    for pixel in logo_data:
        # If pixel is black (or dark), make it white
        if pixel[0] < 128 and pixel[1] < 128 and pixel[2] < 128:
            new_logo_data.append((255, 255, 255, pixel[3]))  # White with same alpha
        else:
            new_logo_data.append(pixel)
    
    logo.putdata(new_logo_data)
    
    # Resize logo
    logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Calculate position
    if logo_position is None:
        # Auto-center on chest area (approximately 40-50% down from top, centered horizontally)
        x = (portrait.width - logo_size) // 2
        y = int(portrait.height * 0.45)
    else:
        x, y = logo_position
        x = x - (logo_size // 2)  # Center on position
        y = y - (logo_size // 2)
    
    # Composite logo onto portrait
    portrait.paste(logo, (x, y), logo)
    
    # Convert back to RGB and save
    final = portrait.convert('RGB')
    final.save(output_path, 'PNG', quality=95)
    
    print(f"✅ Added PSL logo to portrait: {os.path.basename(output_path)}")
    print(f"   Logo size: {logo_size}px")
    print(f"   Logo position: ({x}, {y})")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python add_psl_logo_to_portrait.py <portrait_path> <logo_path> <output_path> [logo_size] [x] [y]")
        sys.exit(1)
    
    portrait_path = sys.argv[1]
    logo_path = sys.argv[2]
    output_path = sys.argv[3]
    
    logo_size = int(sys.argv[4]) if len(sys.argv) > 4 else 200
    
    if len(sys.argv) > 6:
        logo_position = (int(sys.argv[5]), int(sys.argv[6]))
    else:
        logo_position = None
    
    add_psl_logo_to_portrait(portrait_path, logo_path, output_path, logo_size, logo_position)
