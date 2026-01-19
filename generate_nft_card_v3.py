#!/usr/bin/env python3.11
"""
NFT Card Generator V3 - Exact Ryan Connor Template Match
- Pure black background (#000000)
- All 10 badge slots visible (empty ones as thin circles)
- Uses saved badge files from project
- Double white border
- Large white name text
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

def generate_nft_card_v3(portrait_path, performer_name, output_path, badge_paths=[]):
    """
    Generate NFT card matching Ryan Connor's EXACT format.
    
    Args:
        portrait_path: Path to performer portrait
        performer_name: Name in format "FIRSTNAME LASTNAME"
        output_path: Where to save final card
        badge_paths: List of badge image paths (up to 10)
    """
    # Card dimensions
    CARD_WIDTH = 1536
    CARD_HEIGHT = 2752
    
    # Create PURE BLACK background (not gradient!)
    card = Image.new('RGB', (CARD_WIDTH, CARD_HEIGHT), color='#000000')
    draw = ImageDraw.Draw(card)
    
    # Draw double white border (matching Ryan Connor)
    # Outer border (thicker)
    draw.rectangle([(10, 10), (CARD_WIDTH-10, CARD_HEIGHT-10)], outline='#FFFFFF', width=8)
    # Inner border (thinner)
    draw.rectangle([(30, 30), (CARD_WIDTH-30, CARD_HEIGHT-30)], outline='#FFFFFF', width=4)
    
    # === PORTRAIT SECTION (top ~58% of card) ===
    portrait = Image.open(portrait_path).convert('RGB')
    portrait_height = int(CARD_HEIGHT * 0.58)
    portrait_width = CARD_WIDTH - 80  # Leave margin for borders
    
    # Resize portrait to fit
    portrait.thumbnail((portrait_width, portrait_height), Image.Resampling.LANCZOS)
    
    # Center portrait
    portrait_x = (CARD_WIDTH - portrait.width) // 2
    portrait_y = 50
    
    card.paste(portrait, (portrait_x, portrait_y))
    
    # === NAME SECTION (around 15% of card) ===
    name_section_top = int(CARD_HEIGHT * 0.60)
    name_section_height = int(CARD_HEIGHT * 0.15)
    
    # Try to load bold font for name
    try:
        # Try multiple font options
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "arial.ttf"
        ]
        
        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                # Start with large font size and adjust
                font_size = 200
                font = ImageFont.truetype(font_path, font_size)
                
                # Measure text width
                bbox = draw.textbbox((0, 0), performer_name, font=font)
                text_width = bbox[2] - bbox[0]
                
                # Adjust font size to fit width (leave some margin)
                max_width = CARD_WIDTH - 100
                while text_width > max_width and font_size > 80:
                    font_size -= 10
                    font = ImageFont.truetype(font_path, font_size)
                    bbox = draw.textbbox((0, 0), performer_name, font=font)
                    text_width = bbox[2] - bbox[0]
                
                print(f"✓ Drew name '{performer_name}' at font size {font_size}pt")
                break
        
        if font:
            # Draw name centered
            draw.text((CARD_WIDTH//2, name_section_top + name_section_height//2), 
                     performer_name, 
                     fill='#FFFFFF', 
                     font=font,
                     anchor="mm")
    except Exception as e:
        print(f"⚠ Error drawing text: {e}")
        # Fallback to default font
        draw.text((CARD_WIDTH//2, name_section_top + name_section_height//2), 
                 performer_name, fill='#FFFFFF', anchor="mm")
    
    # === BADGE SECTION (bottom ~22% of card) ===
    badge_section_top = int(CARD_HEIGHT * 0.78)
    badge_size = 180
    badge_spacing = 60
    
    # Always show 10 badge slots (2 rows of 5)
    badges_per_row = 5
    total_slots = 10
    
    # Calculate starting X position to center the row of 5 badges
    row_width = (badges_per_row * badge_size) + ((badges_per_row - 1) * badge_spacing)
    badges_start_x = (CARD_WIDTH - row_width) // 2
    
    # Draw all 10 badge slots
    for i in range(total_slots):
        row = i // 5
        col = i % 5
        
        x = badges_start_x + (col * (badge_size + badge_spacing))
        y = badge_section_top + (row * (badge_size + badge_spacing))
        
        # If we have a badge for this slot, place it
        if i < len(badge_paths) and os.path.exists(badge_paths[i]):
            try:
                badge = Image.open(badge_paths[i]).convert('RGBA')
                badge = badge.resize((badge_size, badge_size), Image.Resampling.LANCZOS)
                
                # Paste badge with alpha transparency
                card.paste(badge, (x, y), badge)
                print(f"✓ Placed badge {i+1} at slot {i+1}")
            except Exception as e:
                print(f"⚠ Error placing badge {badge_paths[i]}: {e}")
                # Draw empty slot circle
                draw.ellipse([(x, y), (x + badge_size, y + badge_size)], 
                           outline='#444444', width=2)
        else:
            # Draw empty slot as thin circle (like Ryan Connor)
            draw.ellipse([(x, y), (x + badge_size, y + badge_size)], 
                       outline='#444444', width=2)
    
    # Save final card
    card.save(output_path, 'PNG', quality=95)
    print(f"\n✅ NFT card created: {os.path.basename(output_path)}")
    print(f"   Size: {CARD_WIDTH}x{CARD_HEIGHT}")
    print(f"   Performer: {performer_name}")
    print(f"   Badges: {len(badge_paths)}/10 slots filled")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python generate_nft_card_v3.py <portrait_path> <performer_name> <output_path> [badge_path1] [badge_path2] ...")
        sys.exit(1)
    
    portrait_path = sys.argv[1]
    performer_name = sys.argv[2]
    output_path = sys.argv[3]
    badge_paths = sys.argv[4:] if len(sys.argv) > 4 else []
    
    generate_nft_card_v3(portrait_path, performer_name, output_path, badge_paths)
