#!/usr/bin/env python3.11
from PIL import Image, ImageDraw
import numpy as np

# Load the image
img = Image.open('/home/ubuntu/fantasy-movie-league/type-logo-anal-queen-centered.png').convert('RGBA')
width, height = img.size

# Convert to numpy for easier manipulation
data = np.array(img)

# Create circular mask
mask = Image.new('L', (width, height), 0)
draw = ImageDraw.Draw(mask)
center = width // 2
radius = min(width, height) // 2 - 2
draw.ellipse([(center - radius, center - radius), 
              (center + radius, center + radius)], fill=255)

# Convert mask to numpy
mask_data = np.array(mask)

# Set alpha to 0 for everything outside the circle
data[:, :, 3] = mask_data

# Also make very light colors (close to white/gray background) transparent
# This removes the light background artifacts
r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
light_pixels = (r > 200) & (g > 200) & (b > 200)  # Light gray/white pixels
data[light_pixels, 3] = 0  # Make them transparent

# Convert back to image
result = Image.fromarray(data, 'RGBA')
result.save('/home/ubuntu/fantasy-movie-league/client/public/type-logo-anal-queen.png', 'PNG')

print("✅ Anal Queen logo fixed with aggressive transparency removal")
