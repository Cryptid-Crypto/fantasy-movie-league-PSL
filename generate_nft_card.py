#!/usr/bin/env python3.11
"""
NFT Card Generator for Porn Star League
Generates performer NFT cards with consistent styling and badge placement.

Usage:
    python3.11 generate_nft_card.py <portrait_image> <performer_name> <output_file> [badge1] [badge2] ...

Example:
    python3.11 generate_nft_card.py ryan-portrait.png "RYAN CONNOR" ryan-card.png country-logo-usa.png type-logo-anal-queen.png type-logo-milf.png type-logo-legend.png
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

def generate_nft_card(portrait_path, performer_name, output_path, badge_logos=[]):
    """
    Generate an NFT card with portrait, name, and badges.
    
    Args:
        portrait_path: Path to performer portrait image
        performer_name: Name to display on card (e.g., "RYAN CONNOR")
        output_path: Where to save the final card
        badge_logos: List of paths to badge logo PNGs (up to 10)
    """
    # Card dimensions
    card_width = 1536
    card_height = 2752
    
    # Create black background with white border (RGBA for proper transparency)
    card = Image.new('RGBA', (card_width, card_height), color='#000000')
    draw = ImageDraw.Draw(card)
    
    # Draw white border (20px)
    border_width = 20
    draw.rectangle(
        [(border_width, border_width), 
         (card_width - border_width, card_height - border_width)],
        outline='#FFFFFF',
        width=4
    )
    
    # Load and paste portrait (upper 60% of card)
    portrait = Image.open(portrait_path).convert('RGBA')
    portrait_height = int(card_height * 0.55)  # Reduced from 0.60 to leave room for name
    portrait_width = card_width - (border_width * 2) - 40  # Extra margin
    
    # Resize portrait to fit
    portrait.thumbnail((portrait_width, portrait_height), Image.Resampling.LANCZOS)
    
    # Center portrait horizontally, position at top
    portrait_x = (card_width - portrait.width) // 2
    portrait_y = border_width + 40
    
    # Paste portrait
    if portrait.mode == 'RGBA':
        card.paste(portrait, (portrait_x, portrait_y), portrait)
    else:
        card.paste(portrait, (portrait_x, portrait_y))
    
    # Add performer name (middle 15% section)
    name_section_top = int(card_height * 0.58)
    name_section_height = int(card_height * 0.12)
    
    # Draw name background section (dark gray bar)
    draw.rectangle(
        [(border_width, name_section_top), 
         (card_width - border_width, name_section_top + name_section_height)],
        fill='#1a1a1a'
    )
    
    # Try to load a bold font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 180)
    except:
        font = ImageFont.load_default()
    
    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), performer_name, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (card_width - text_width) // 2
    text_y = name_section_top + (name_section_height - text_height) // 2
    
    draw.text((text_x, text_y), performer_name, fill='#FFFFFF', font=font)
    
    # Add badges (bottom 25% section)
    badge_size = 200
    badge_spacing = 50
    
    # Calculate badge grid positioning (2 rows of 5)
    row_width = (badge_size * 5) + (badge_spacing * 4)
    badges_start_x = (card_width - row_width) // 2
    
    bottom_margin = 150
    badges_bottom_y = card_height - bottom_margin - (badge_size * 2) - badge_spacing
    
    # Place badges
    for i, badge_path in enumerate(badge_logos[:10]):  # Max 10 badges
        if not os.path.exists(badge_path):
            print(f"⚠ Badge not found: {badge_path}")
            continue
        
        # Calculate position (2 rows of 5)
        row = i // 5
        col = i % 5
        
        x = badges_start_x + (col * (badge_size + badge_spacing))
        y = badges_bottom_y + (row * (badge_size + badge_spacing))
        
        # Load and resize badge
        badge = Image.open(badge_path).convert('RGBA')
        badge = badge.resize((badge_size, badge_size), Image.Resampling.LANCZOS)
        
        # Paste badge with transparency
        card.paste(badge, (x, y), badge)
        print(f"✓ Placed {os.path.basename(badge_path)} at ({x}, {y})")
    
    # Save final card
    card.save(output_path, 'PNG', quality=95)
    print(f"\n✅ NFT card created: {output_path}")
    print(f"   Card size: {card_width}x{card_height}")
    print(f"   Performer: {performer_name}")
    print(f"   Badges: {len(badge_logos)}/10")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3.11 generate_nft_card.py <portrait> <name> <output> [badge1] [badge2] ...")
        print("\nExample:")
        print('  python3.11 generate_nft_card.py ryan.png "RYAN CONNOR" card.png usa.png anal-queen.png')
        sys.exit(1)
    
    portrait = sys.argv[1]
    name = sys.argv[2]
    output = sys.argv[3]
    badges = sys.argv[4:] if len(sys.argv) > 4 else []
    
    generate_nft_card(portrait, name, output, badges)
