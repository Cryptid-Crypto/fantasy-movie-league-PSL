#!/usr/bin/env python3
"""
Add PSL Bunny Logo to Portrait Images

This script composites the official PSL bunny logo onto performer portrait images.
The logo is positioned in the bottom-right corner of each portrait.

Usage:
    python addPSLLogoToPortraits.py <portrait_directory> [--output <output_directory>]

Example:
    python addPSLLogoToPortraits.py ./portraits --output ./portraits_with_logo
"""

import os
import sys
from pathlib import Path
from PIL import Image


def add_logo_to_portrait(portrait: Image.Image, logo_path: str) -> Image.Image:
    """
    Add the PSL logo to a portrait image.
    
    Args:
        portrait: The portrait PIL Image object
        logo_path: Path to the logo image file
    
    Returns:
        A new PIL Image with the logo composited in the bottom-right corner
    """
    # Load the logo
    logo = Image.open(logo_path)
    
    # Ensure logo has alpha channel for transparency
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    # Make a copy of the portrait to avoid modifying the original
    result = portrait.copy()
    
    # Ensure result has alpha channel
    if result.mode != 'RGBA':
        result = result.convert('RGBA')
    
    # Calculate position (bottom-right corner with 10px padding)
    padding = 10
    x = result.width - logo.width - padding
    y = result.height - logo.height - padding
    
    # Composite the logo onto the portrait
    result.paste(logo, (x, y), logo)
    
    return result


def process_portrait_directory(input_dir: str, output_dir: str, logo_path: str) -> int:
    """
    Process all portrait images in a directory.
    
    Args:
        input_dir: Directory containing portrait images
        output_dir: Directory to save processed images
        logo_path: Path to the logo image file
    
    Returns:
        Number of successfully processed images
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Supported image extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    processed_count = 0
    
    # Process each image file
    for image_file in input_path.iterdir():
        if image_file.suffix.lower() in extensions:
            try:
                # Open the portrait
                portrait = Image.open(image_file)
                
                # Add logo
                result = add_logo_to_portrait(portrait, logo_path)
                
                # Save to output directory
                output_file = output_path / image_file.name
                
                # Convert back to RGB if saving as JPEG
                if image_file.suffix.lower() in {'.jpg', '.jpeg'}:
                    result = result.convert('RGB')
                
                result.save(output_file)
                processed_count += 1
                print(f"✓ Processed: {image_file.name}")
                
            except Exception as e:
                print(f"✗ Failed to process {image_file.name}: {e}")
    
    return processed_count


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python addPSLLogoToPortraits.py <portrait_directory> [--output <output_directory>]")
        print("\nExample:")
        print("  python addPSLLogoToPortraits.py ./portraits --output ./portraits_with_logo")
        return 1
    
    input_dir = sys.argv[1]
    
    # Parse optional output directory
    output_dir = None
    if '--output' in sys.argv:
        try:
            output_idx = sys.argv.index('--output')
            output_dir = sys.argv[output_idx + 1]
        except (ValueError, IndexError):
            print("Error: --output requires a directory path")
            return 1
    
    # Default output directory
    if not output_dir:
        output_dir = input_dir + "_with_logo"
    
    # Find logo path (look in assets directory)
    script_dir = Path(__file__).parent
    logo_path = script_dir.parent / "assets" / "psl-bunny-logo.png"
    
    if not logo_path.exists():
        print(f"Error: Logo file not found at {logo_path}")
        return 1
    
    # Validate input directory
    if not Path(input_dir).is_dir():
        print(f"Error: Input directory not found: {input_dir}")
        return 1
    
    # Process portraits
    print(f"Processing portraits from: {input_dir}")
    print(f"Output directory: {output_dir}")
    print(f"Logo: {logo_path}")
    print()
    
    count = process_portrait_directory(input_dir, output_dir, str(logo_path))
    
    print(f"\n✓ Successfully processed {count} portrait(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
