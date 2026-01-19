#!/usr/bin/env python3.11
from PIL import Image, ImageDraw
import os

# Load card template
card_template = '/home/ubuntu/fantasy-movie-league/ryan-connor-final-template.png'
output_path = "/home/ubuntu/fantasy-movie-league/nft-card-ryan-connor-balanced.png"

# Logo paths - using EXACT finalized logos
usa_flag_logo = "/home/ubuntu/fantasy-movie-league/client/public/country-logo-usa.png"
anal_queen_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-anal-queen.png"
milf_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-milf.png"
legend_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-legend.png"

# Load card template
card = Image.open(card_template).convert('RGBA')
card_width, card_height = card.size
print(f"Card size: {card_width}x{card_height}")

# Badge configuration - larger for better proportions
badge_size = 200  # Larger badges for better visual balance
badge_spacing = 50  # Balanced spacing

# Calculate total width needed for 5 badges per row
row_width = (badge_size * 5) + (badge_spacing * 4)
badges_start_x = (card_width - row_width) // 2

# Position badges higher for better balance with extended portrait
# Raise badges significantly from bottom
bottom_margin = 150  # More space from bottom
badges_bottom_y = card_height - bottom_margin - (badge_size * 2) - badge_spacing

# Top row and bottom row positions
top_row_y = badges_bottom_y
bottom_row_y = top_row_y + badge_size + badge_spacing

# Create positions for 2 rows of 5 badges (10 total)
badge_positions = []
for row_idx, row_y in enumerate([top_row_y, bottom_row_y]):
    for col_idx in range(5):
        x = badges_start_x + col_idx * (badge_size + badge_spacing)
        badge_positions.append((x, row_y))

# Logos to place (10 slots: 4 filled + 6 empty)
logos = [
    usa_flag_logo,     # Row 1, Col 1
    anal_queen_logo,   # Row 1, Col 2
    milf_logo,         # Row 1, Col 3
    legend_logo,       # Row 1, Col 4
    None,              # Row 1, Col 5 - Empty
    None,              # Row 2, Col 1 - Empty
    None,              # Row 2, Col 2 - Empty
    None,              # Row 2, Col 3 - Empty
    None,              # Row 2, Col 4 - Empty
    None,              # Row 2, Col 5 - Empty
]

# Draw empty circles for placeholder badges first
draw = ImageDraw.Draw(card)
for i, (logo_path, (x, y)) in enumerate(zip(logos, badge_positions)):
    if logo_path is None:
        # Draw subtle empty circle
        center_x = x + badge_size // 2
        center_y = y + badge_size // 2
        radius = (badge_size // 2) - 5
        draw.ellipse(
            [(center_x - radius, center_y - radius), 
             (center_x + radius, center_y + radius)],
            outline=(255, 255, 255, 80),
            width=2
        )

# Paste exact logos onto card with high quality and transparency
for logo_path, (x, y) in zip(logos, badge_positions):
    if logo_path and os.path.exists(logo_path):
        logo = Image.open(logo_path).convert('RGBA')
        # Resize logo with best quality resampling (LANCZOS for downscaling)
        logo = logo.resize((badge_size, badge_size), Image.Resampling.LANCZOS)
        # Paste with alpha channel to preserve transparency
        card.paste(logo, (x, y), logo)
        print(f"✓ Placed {os.path.basename(logo_path)} at ({x}, {y})")

# Convert to RGB for final save (composite alpha onto black background)
final_card = Image.new('RGB', card.size, (0, 0, 0))
final_card.paste(card, (0, 0), card)

# Save final card with maximum quality
final_card.save(output_path, 'PNG', quality=100, optimize=False)
print(f"\n✅ Balanced NFT card created: {output_path}")
print(f"   Badge size: {badge_size}px")
print(f"   Spacing: {badge_spacing}px")
print(f"   Bottom margin: {bottom_margin}px")
