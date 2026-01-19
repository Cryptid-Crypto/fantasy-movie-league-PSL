#!/usr/bin/env python3.11
from PIL import Image, ImageDraw
import os

# Paths
card_template = "/home/ubuntu/fantasy-movie-league/ryan-connor-hq-template.png"
output_path = "/home/ubuntu/fantasy-movie-league/nft-card-ryan-connor-premium.png"

# Logo paths - using EXACT finalized logos
usa_flag_logo = "/home/ubuntu/fantasy-movie-league/client/public/country-logo-usa.png"
anal_queen_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-anal-queen.png"
milf_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-milf.png"
legend_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-legend.png"

# Load card template
card = Image.open(card_template).convert('RGBA')
card_width, card_height = card.size
print(f"Card size: {card_width}x{card_height}")

# Badge configuration - larger and better positioned
badge_size = 140  # Larger badges for better quality
badge_spacing = 40

# Calculate positions for 2 rows of 3 badges
row_width = (badge_size * 3) + (badge_spacing * 2)
badges_start_x = (card_width - row_width) // 2
badges_start_y = card_height - 360  # Position from bottom with more space

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

# Draw empty circles for placeholder badges
draw = ImageDraw.Draw(card)
for i, (logo_path, (x, y)) in enumerate(zip(logos, badge_positions)):
    if logo_path is None:
        # Draw empty circle
        draw.ellipse(
            [(x + 10, y + 10), (x + badge_size - 10, y + badge_size - 10)],
            outline='white',
            width=3
        )

# Paste exact logos onto card with high quality
for logo_path, (x, y) in zip(logos, badge_positions):
    if logo_path and os.path.exists(logo_path):
        logo = Image.open(logo_path).convert('RGBA')
        # Resize logo with best quality resampling
        logo = logo.resize((badge_size, badge_size), Image.Resampling.LANCZOS)
        # Paste with alpha channel for perfect transparency
        card.paste(logo, (x, y), logo)

# Convert back to RGB for final save
final_card = Image.new('RGB', card.size, (0, 0, 0))
final_card.paste(card, (0, 0), card if card.mode == 'RGBA' else None)

# Save final card with maximum quality
final_card.save(output_path, 'PNG', quality=100, optimize=False)
print(f"✅ Premium NFT card created: {output_path}")
