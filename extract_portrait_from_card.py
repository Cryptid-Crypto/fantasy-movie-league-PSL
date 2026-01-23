#!/usr/bin/env python3
"""
Extract portrait section from NFT card image.
The card has portrait in top ~58% of the image.
"""

from PIL import Image
import sys

def extract_portrait(card_path, output_path):
    """
    Extract the portrait section from an NFT card.
    
    Args:
        card_path: Path to the NFT card image
        output_path: Where to save the extracted portrait
    """
    # Open the card
    card = Image.open(card_path)
    
    # Card dimensions (from generate_nft_card_v3.py)
    card_width = card.width
    card_height = card.height
    
    # Portrait is in top ~58% of card, with margins
    portrait_top = 50  # Top margin
    portrait_height = int(card_height * 0.58)
    portrait_left = 40  # Left margin
    portrait_right = card_width - 40  # Right margin
    
    # Extract portrait region
    portrait = card.crop((portrait_left, portrait_top, portrait_right, portrait_top + portrait_height))
    
    # Save as PNG
    portrait.save(output_path, 'PNG')
    print(f"✓ Extracted portrait from {card_path}")
    print(f"✓ Saved to {output_path}")
    print(f"  Portrait size: {portrait.width}x{portrait.height}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 extract_portrait_from_card.py <card_path> <output_path>")
        sys.exit(1)
    
    card_path = sys.argv[1]
    output_path = sys.argv[2]
    
    extract_portrait(card_path, output_path)
