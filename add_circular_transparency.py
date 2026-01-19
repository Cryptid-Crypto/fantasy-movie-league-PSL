#!/usr/bin/env python3.11
from PIL import Image, ImageDraw
import os

def add_circular_transparency(input_path, output_path):
    """Add circular alpha mask to make everything outside the circle transparent"""
    # Load image
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    
    # Create circular mask
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw white circle (255 = fully opaque)
    center = width // 2
    radius = min(width, height) // 2 - 2  # Minimal margin
    draw.ellipse([(center - radius, center - radius), 
                  (center + radius, center + radius)], fill=255)
    
    # Apply mask to alpha channel
    img.putalpha(mask)
    
    # Save with transparency
    img.save(output_path, 'PNG')
    print(f"✓ Added circular transparency: {os.path.basename(output_path)}")

# Process Anal Queen logo
add_circular_transparency(
    '/home/ubuntu/fantasy-movie-league/type-logo-anal-queen-centered.png',
    '/home/ubuntu/fantasy-movie-league/client/public/type-logo-anal-queen.png'
)

print("✅ Anal Queen logo now has perfect circular transparency")
