#!/usr/bin/env python3.11
from PIL import Image
import os

# Paths
card_template = "/home/ubuntu/fantasy-movie-league/ryan-connor-card-template.png"
output_path = "/home/ubuntu/fantasy-movie-league/nft-card-ryan-connor-final.png"

# Logo paths - using EXACT finalized logos
usa_flag_logo = "/home/ubuntu/fantasy-movie-league/client/public/country-logo-usa.png"
anal_queen_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-anal-queen.png"
milf_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-milf.png"
legend_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-legend.png"

# Load card template
card = Image.open(card_template)
card_width, card_height = card.size

# Badge configuration
badge_size = 100  # Larger badges
badge_spacing = 30

# Calculate positions for 2 rows of 3 badges
row_width = (badge_size * 3) + (badge_spacing * 2)
badges_start_x = (card_width - row_width) // 2
badges_start_y = card_height - 280  # Position from bottom

# Top row positions
top_row_y = badges_start_y
# Bottom row positions  
bottom_row_y = top_row_y + badge_size + badge_spacing

badge_positions = [
    (badges_start_x, top_row_y),  # USA flag
    (badges_start_x + badge_size + badge_spacing, top_row_y),  # Anal Queen
    (badges_start_x + (badge_size + badge_spacing) * 2, top_row_y),  # MILF
    (badges_start_x, bottom_row_y),  # Legend
    (badges_start_x + badge_size + badge_spacing, bottom_row_y),  # Empty
    (badges_start_x + (badge_size + badge_spacing) * 2, bottom_row_y),  # Empty
]

# Logos to place
logos = [
    usa_flag_logo,
    anal_queen_logo,
    milf_logo,
    legend_logo,
    None,  # Empty
    None,  # Empty
]

# Paste exact logos onto card
for logo_path, (x, y) in zip(logos, badge_positions):
    if logo_path and os.path.exists(logo_path):
        logo = Image.open(logo_path)
        # Resize logo to badge size
        logo = logo.resize((badge_size, badge_size), Image.Resampling.LANCZOS)
        # Paste with alpha channel for transparency
        if logo.mode == 'RGBA':
            card.paste(logo, (x, y), logo)
        else:
            card.paste(logo, (x, y))

# Save final card
card.save(output_path, 'PNG', quality=95)
print(f"✅ Final NFT card created with EXACT logos: {output_path}")
print(f"   - USA Flag: {os.path.exists(usa_flag_logo)}")
print(f"   - Anal Queen: {os.path.exists(anal_queen_logo)}")
print(f"   - MILF: {os.path.exists(milf_logo)}")
print(f"   - Legend: {os.path.exists(legend_logo)}")
