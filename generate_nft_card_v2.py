#!/usr/bin/env python3.11
"""
NFT Card Generator V2 - Matches Ryan Connor Template Exactly
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

def generate_nft_card_v2(portrait_path, performer_name, output_path, badge_paths=[]):
    """
    Generate NFT card matching Ryan Connor's exact format.
    
    Args:
        portrait_path: Path to performer portrait
        performer_name: Name in format "FIRSTNAME LASTNAME"
        output_path: Where to save final card
        badge_paths: List of badge image paths (up to 10)
    """
    # Card dimensions (same as Ryan Connor)
    CARD_WIDTH = 1536
    CARD_HEIGHT = 2752
    
    # Create black background
    card = Image.new('RGB', (CARD_WIDTH, CARD_HEIGHT), color='#000000')
    draw = ImageDraw.Draw(card)
    
    # Draw white border (double border like Ryan Connor)
    # Outer border
    draw.rectangle([(10, 10), (CARD_WIDTH-10, CARD_HEIGHT-10)], outline='#FFFFFF', width=6)
    # Inner border
    draw.rectangle([(30, 30), (CARD_WIDTH-30, CARD_HEIGHT-30)], outline='#FFFFFF', width=4)
    
    # === PORTRAIT SECTION (top 58% of card) ===
    portrait = Image.open(portrait_path).convert('RGB')
    portrait_height = int(CARD_HEIGHT * 0.58)
    portrait_width = CARD_WIDTH - 80  # Leave margin for borders
    
    # Resize portrait to fit
    portrait.thumbnail((portrait_width, portrait_height), Image.Resampling.LANCZOS)
    
    # Center portrait
    portrait_x = (CARD_WIDTH - portrait.width) // 2
    portrait_y = 50
    
    card.paste(portrait, (portrait_x, portrait_y))
    
    # === NAME SECTION (12% of card, around Y=1600-1900) ===
    name_section_top = int(CARD_HEIGHT * 0.60)
    name_section_height = int(CARD_HEIGHT * 0.15)
    
    # Black background for name section (already black, no need to draw)
    
    # Draw LARGE white text for name (like Ryan Connor)
    try:
        # Try multiple font sizes to find the largest that fits
        font_size = 200
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        
        # Get text dimensions
        bbox = draw.textbbox((0, 0), performer_name, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # If text is too wide, reduce font size
        while text_width > (CARD_WIDTH - 100) and font_size > 100:
            font_size -= 10
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            bbox = draw.textbbox((0, 0), performer_name, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        
        # Center text horizontally and vertically in name section
        text_x = (CARD_WIDTH - text_width) // 2
        text_y = name_section_top + (name_section_height - text_height) // 2
        
        # Draw white text
        draw.text((text_x, text_y), performer_name, fill='#FFFFFF', font=font)
        print(f"✓ Drew name '{performer_name}' at font size {font_size}pt")
        
    except Exception as e:
        print(f"⚠ Error drawing text: {e}")
        # Fallback to default font
        draw.text((CARD_WIDTH//2, name_section_top + name_section_height//2), 
                 performer_name, fill='#FFFFFF', anchor="mm")
    
    # === BADGE SECTION (bottom 22% of card) ===
    badge_section_top = int(CARD_HEIGHT * 0.78)
    badge_size = 180
    badge_spacing = 60
    
    # Calculate starting position for centered badges
    total_badges = min(len(badge_paths), 10)
    badges_per_row = 5
    
    # Starting X position to center the row of 5 badges
    row_width = (badges_per_row * badge_size) + ((badges_per_row - 1) * badge_spacing)
    badges_start_x = (CARD_WIDTH - row_width) // 2
    
    # Place badges
    for i, badge_path in enumerate(badge_paths[:10]):
        if not os.path.exists(badge_path):
            print(f"⚠ Badge not found: {badge_path}")
            continue
        
        # Calculate position (2 rows of 5)
        row = i // 5
        col = i % 5
        
        x = badges_start_x + (col * (badge_size + badge_spacing))
        y = badge_section_top + (row * (badge_size + badge_spacing))
        
        # Load and resize badge
        try:
            badge = Image.open(badge_path).convert('RGBA')
            badge = badge.resize((badge_size, badge_size), Image.Resampling.LANCZOS)
            
            # Paste badge with alpha transparency
            card.paste(badge, (x, y), badge)
            print(f"✓ Placed badge {i+1} at ({x}, {y})")
        except Exception as e:
            print(f"⚠ Error placing badge {badge_path}: {e}")
    
    # Save final card
    card.save(output_path, 'PNG', quality=95)
    print(f"\n✅ NFT card created: {output_path}")
    print(f"   Size: {CARD_WIDTH}x{CARD_HEIGHT}")
    print(f"   Performer: {performer_name}")
    print(f"   Badges: {len(badge_paths)}/10")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3.11 generate_nft_card_v2.py <portrait> <name> <output> [badge1] [badge2] ...")
        print("\nExample:")
        print('  python3.11 generate_nft_card_v2.py portrait.png "RYAN CONNOR" card.png badge1.png badge2.png')
        sys.exit(1)
    
    portrait = sys.argv[1]
    name = sys.argv[2]
    output = sys.argv[3]
    badges = sys.argv[4:] if len(sys.argv) > 4 else []
    
    generate_nft_card_v2(portrait, name, output, badges)
