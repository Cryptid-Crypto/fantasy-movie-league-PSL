#!/usr/bin/env python3.11
"""
Fix Badge Transparency Script
Converts badge images from RGB to RGBA with proper transparency.
Removes gray/white backgrounds and makes them truly transparent.
"""

from PIL import Image
import os
import glob

def make_transparent(image_path, output_path=None, threshold=240):
    """
    Convert an image to RGBA and make light-colored backgrounds transparent.
    
    Args:
        image_path: Path to input image
        output_path: Path to save output (defaults to overwriting input)
        threshold: RGB value threshold for transparency (0-255)
                  Pixels with all RGB values above this become transparent
    """
    if output_path is None:
        output_path = image_path
    
    # Load image
    img = Image.open(image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get pixel data
    pixels = img.load()
    width, height = img.size
    
    # Make light pixels transparent
    transparent_count = 0
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # If pixel is light gray/white (all RGB values above threshold)
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)  # Make fully transparent
                transparent_count += 1
    
    # Save with transparency
    img.save(output_path, 'PNG')
    print(f"✓ Processed {os.path.basename(image_path)}")
    print(f"  Made {transparent_count:,} pixels transparent")
    print(f"  Saved to: {output_path}")
    
    return transparent_count


def fix_all_badges(badges_dir='client/public', pattern='*-logo-*.png'):
    """
    Fix transparency for all badge images in a directory.
    """
    search_pattern = os.path.join(badges_dir, pattern)
    badge_files = glob.glob(search_pattern)
    
    print(f"Found {len(badge_files)} badge files to process\n")
    
    total_fixed = 0
    for badge_file in sorted(badge_files):
        try:
            count = make_transparent(badge_file, threshold=240)
            total_fixed += 1
            print()
        except Exception as e:
            print(f"✗ Error processing {badge_file}: {e}\n")
    
    print(f"\n{'='*60}")
    print(f"✅ Successfully processed {total_fixed}/{len(badge_files)} badge files")
    print(f"{'='*60}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Process single file
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None
        threshold = int(sys.argv[3]) if len(sys.argv) > 3 else 240
        
        make_transparent(input_file, output_file, threshold)
    else:
        # Process all badges
        fix_all_badges()
