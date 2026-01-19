#!/usr/bin/env python3.11
"""
Aggressive Badge Background Removal
Removes ALL pixels outside the circular badge area to ensure clean transparency.
"""

from PIL import Image, ImageDraw
import numpy as np
import sys

def remove_badge_background(input_path, output_path=None):
    """
    Remove background from a circular badge image.
    Makes everything outside the circular badge fully transparent.
    """
    if output_path is None:
        output_path = input_path
    
    # Load image
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    
    # Create a circular mask
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw a circle that covers the badge area (with some margin)
    # Assume badge is centered and takes up ~90% of the image
    center_x, center_y = width // 2, height // 2
    radius = int(min(width, height) * 0.48)  # 48% radius = 96% diameter
    
    draw.ellipse(
        [(center_x - radius, center_y - radius),
         (center_x + radius, center_y + radius)],
        fill=255
    )
    
    # Apply mask to alpha channel
    img_array = np.array(img)
    mask_array = np.array(mask)
    
    # Set alpha to 0 for all pixels outside the circle
    img_array[:, :, 3] = np.minimum(img_array[:, :, 3], mask_array)
    
    # Also make very light pixels transparent (gray/white backgrounds)
    rgb = img_array[:, :, :3]
    light_pixels = (rgb[:, :, 0] > 200) & (rgb[:, :, 1] > 200) & (rgb[:, :, 2] > 200)
    img_array[light_pixels, 3] = 0
    
    # Convert back to image and save
    result = Image.fromarray(img_array, 'RGBA')
    result.save(output_path, 'PNG')
    
    print(f"✓ Processed: {input_path}")
    print(f"  Saved to: {output_path}")
    
    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3.11 fix_badge_background.py <input_image> [output_image]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    remove_badge_background(input_file, output_file)
