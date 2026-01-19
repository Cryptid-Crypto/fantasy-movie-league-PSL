#!/usr/bin/env python3.11
from PIL import Image, ImageDraw, ImageFont
import os

# Paths
base_portrait = "/home/ubuntu/fantasy-movie-league/nft-ryan-connor-v2.png"
output_path = "/home/ubuntu/fantasy-movie-league/nft-ryan-connor-card-with-logos.png"

# Logo paths
usa_flag_path = None  # We'll need to create this
anal_queen_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-anal-queen.png"
milf_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-milf.png"
legend_logo = "/home/ubuntu/fantasy-movie-league/client/public/type-logo-legend.png"

# Card dimensions (portrait orientation)
card_width = 600
card_height = 900
border_width = 10

# Create new card with black background
card = Image.new('RGB', (card_width, card_height), color='black')
draw = ImageDraw.Draw(card)

# Draw white border
draw.rectangle(
    [(0, 0), (card_width-1, card_height-1)],
    outline='white',
    width=border_width
)

# Load and resize portrait
portrait = Image.open(base_portrait)
# Make portrait smaller to fit everything
portrait_height = 450
portrait_width = int(portrait_height * portrait.width / portrait.height)
portrait = portrait.resize((portrait_width, portrait_height), Image.Resampling.LANCZOS)

# Paste portrait
portrait_x = (card_width - portrait_width) // 2
portrait_y = 30
if portrait.mode == 'RGBA':
    card.paste(portrait, (portrait_x, portrait_y), portrait)
else:
    card.paste(portrait, (portrait_x, portrait_y))

# Add name text
name_y = portrait_y + portrait_height + 20
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
except:
    font = ImageFont.load_default()

name_text = "RYAN CONNOR"
bbox = draw.textbbox((0, 0), name_text, font=font)
text_width = bbox[2] - bbox[0]
text_x = (card_width - text_width) // 2
draw.text((text_x, name_y), name_text, fill='white', font=font)

# Badge positions (2 rows of 3)
badge_size = 80
badge_spacing = 20
badges_start_y = name_y + 80

# Calculate centered positions for 3 badges per row
row_width = (badge_size * 3) + (badge_spacing * 2)
badges_start_x = (card_width - row_width) // 2

# Top row positions
top_row_y = badges_start_y
badge_positions = [
    (badges_start_x, top_row_y),  # USA flag
    (badges_start_x + badge_size + badge_spacing, top_row_y),  # Anal Queen
    (badges_start_x + (badge_size + badge_spacing) * 2, top_row_y),  # MILF
]

# Bottom row positions
bottom_row_y = top_row_y + badge_size + badge_spacing
badge_positions.extend([
    (badges_start_x, bottom_row_y),  # Legend
    (badges_start_x + badge_size + badge_spacing, bottom_row_y),  # Empty
    (badges_start_x + (badge_size + badge_spacing) * 2, bottom_row_y),  # Empty
])

# Load and paste logos
logos = [
    None,  # USA flag placeholder
    anal_queen_logo,
    milf_logo,
    legend_logo,
    None,  # Empty
    None,  # Empty
]

for i, (logo_path, (x, y)) in enumerate(zip(logos, badge_positions)):
    if logo_path and os.path.exists(logo_path):
        logo = Image.open(logo_path)
        logo = logo.resize((badge_size, badge_size), Image.Resampling.LANCZOS)
        card.paste(logo, (x, y), logo if logo.mode == 'RGBA' else None)
    else:
        # Draw empty circle placeholder
        draw.ellipse(
            [(x, y), (x + badge_size, y + badge_size)],
            outline='white',
            width=2
        )

# Save card
card.save(output_path, 'PNG')
print(f"NFT card created: {output_path}")
