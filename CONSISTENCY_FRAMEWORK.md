# Porn Star League - Design Consistency Framework

**Author:** Manus AI  
**Date:** January 19, 2026  
**Version:** 1.0

---

## Executive Summary

This document establishes a systematic framework for maintaining design consistency across the Porn Star League platform, with particular focus on NFT card generation, badge management, and visual asset creation. The framework addresses the technical challenges encountered during badge transparency implementation and provides actionable guidelines to prevent similar issues in future development.

---

## 1. NFT Card Generation System

### 1.1 Technical Specifications

The NFT card generation system is built around a Python script (`generate_nft_card.py`) that composites multiple visual elements into a standardized card format. Understanding the technical requirements ensures consistent output quality across all performer cards.

**Card Dimensions and Layout**

| Component | Specification | Percentage of Card |
|-----------|--------------|-------------------|
| Total Card Size | 1536 × 2752 pixels | 100% |
| Portrait Area | 1536 × 1514 pixels | 55% height |
| Name Section | 1536 × 330 pixels | 12% height |
| Badge Area | 1536 × 600 pixels | 22% height |
| Border Width | 20 pixels (white) | N/A |

**Color Specifications**

| Element | Color Code | Purpose |
|---------|-----------|---------|
| Card Background | `#000000` (Black) | Primary background |
| Name Section Background | `#1a1a1a` (Dark Gray) | Name area contrast |
| Border | `#FFFFFF` (White) | Card framing |
| Text | `#FFFFFF` (White) | Performer name |

### 1.2 Critical Technical Requirements

**Image Mode Requirement**

The card generation script MUST create the base card in **RGBA mode**, not RGB mode. This is essential for proper transparency handling when compositing badge images.

```python
# CORRECT: RGBA mode for transparency support
card = Image.new('RGBA', (card_width, card_height), color='#000000')

# INCORRECT: RGB mode causes transparency artifacts
card = Image.new('RGB', (card_width, card_height), color='#000000')
```

**Badge Compositing**

When pasting badge images onto the card, the third parameter (mask) MUST be provided to enable alpha channel transparency:

```python
# CORRECT: Uses badge's alpha channel as mask
card.paste(badge, (x, y), badge)

# INCORRECT: Ignores transparency
card.paste(badge, (x, y))
```

### 1.3 Badge Placement System

Badges are arranged in a 2-row × 5-column grid at the bottom of the card. The system supports up to 10 badges per card.

**Positioning Calculations**

```python
badges_start_x = 168  # Left margin
badges_bottom_y = 2152  # Top of badge area
badge_size = 200  # Badge display size
badge_spacing = 50  # Gap between badges

# Position calculation for badge index i
row = i // 5
col = i % 5
x = badges_start_x + (col * (badge_size + badge_spacing))
y = badges_bottom_y + (row * (badge_size + badge_spacing))
```

---

## 2. Badge Asset Management

### 2.1 Badge File Requirements

All badge images MUST meet these technical specifications to ensure proper display on NFT cards:

**File Format Requirements**

| Specification | Requirement | Rationale |
|--------------|-------------|-----------|
| File Format | PNG | Supports alpha transparency |
| Color Mode | RGBA | Required for transparency |
| Resolution | 2048 × 2048 pixels | High quality for scaling |
| Transparency | 40-60% of pixels | Circular badge on transparent background |
| File Naming | `type-logo-{name}.png` or `country-logo-{code}.png` | Consistent identification |

**Transparency Validation**

Before using a badge in production, validate its transparency using this Python script:

```python
from PIL import Image
import numpy as np

def validate_badge_transparency(badge_path):
    img = Image.open(badge_path)
    
    # Check 1: Must be RGBA mode
    if img.mode != 'RGBA':
        return False, f"Badge is {img.mode}, must be RGBA"
    
    # Check 2: Must have significant transparency
    alpha = np.array(img)[:,:,3]
    transparent_pixels = np.sum(alpha == 0)
    total_pixels = img.size[0] * img.size[1]
    transparency_percent = (transparent_pixels / total_pixels) * 100
    
    if transparency_percent < 30:
        return False, f"Only {transparency_percent:.1f}% transparent (need 30%+)"
    
    return True, f"Valid badge: {transparency_percent:.1f}% transparent"
```

### 2.2 Badge Generation Guidelines

When generating new badge images using AI tools, follow these guidelines to ensure proper transparency from the start:

**AI Generation Prompt Template**

```
A premium 3D badge icon for '{BADGE_NAME}' performer type. 
Design: Circular badge with {COLOR} metallic rim and border. 
Center features {ICON_DESCRIPTION} against a dark charcoal gray circular background. 
Professional esports/gaming badge aesthetic with depth and shadows. 
High quality render, studio lighting. 
CRITICAL: The entire outer area beyond the circular badge MUST be completely transparent (no background whatsoever).
```

**Post-Generation Processing**

Even with proper generation prompts, AI-generated badges may require post-processing to remove residual backgrounds:

1. **Circular Mask Application**: Apply a circular mask to ensure only the badge area is visible
2. **Light Pixel Removal**: Remove any light gray/white pixels (RGB > 200) that represent background artifacts
3. **Alpha Channel Validation**: Verify the alpha channel has proper 0/255 values with minimal semi-transparency

The `fix_badge_background.py` script automates this process:

```bash
python3.11 fix_badge_background.py client/public/type-logo-new-badge.png
```

### 2.3 Badge Storage and Organization

**Directory Structure**

```
client/public/
├── type-logo-rising-star.png
├── type-logo-girl-next-door.png
├── type-logo-anal-queen.png
├── type-logo-legend.png
├── type-logo-milf.png
├── type-logo-extreme.png
├── type-logo-hall-of-fame.png
├── type-logo-specialist.png
├── type-logo-super-slut.png
├── country-logo-usa.png
├── country-logo-colombia.png
├── country-logo-uk.png
└── psl-logo-official.png
```

**Backup Strategy**

Before modifying any badge file, create a backup with `_original` suffix:

```bash
cp type-logo-rising-star.png type-logo-rising-star_original.png
```

---

## 3. Consistency Maintenance Workflow

### 3.1 Pre-Generation Checklist

Before generating any new NFT cards or badges, complete this checklist:

- [ ] **Reference Card Review**: View the Ryan Connor reference card to confirm the target visual style
- [ ] **Badge Inventory**: Verify all required badge files exist in `client/public/`
- [ ] **Badge Validation**: Run transparency validation on all badges to be used
- [ ] **Script Version**: Confirm `generate_nft_card.py` uses RGBA mode for card creation
- [ ] **Portrait Quality**: Verify portrait image shows head, shoulders, and upper torso with PSL logo on clothing

### 3.2 Generation Workflow

Follow this step-by-step workflow for consistent NFT card generation:

**Step 1: Portrait Preparation**

```bash
# Portrait should be AI-generated with these specifications:
# - 3D animated style (Pixar/Fortnite aesthetic)
# - Head and shoulders visible
# - Black clothing with PSL diamond-bunny logo on fabric
# - Clean background for easy extraction
```

**Step 2: Badge Selection**

```bash
# Determine performer type and country
PERFORMER_TYPE="Rising Star"  # or Girl Next Door, Legend, etc.
COUNTRY="USA"  # or Colombia, UK, etc.

# Badges will be automatically loaded by the script based on performer type
```

**Step 3: Card Generation**

```bash
cd /home/ubuntu/fantasy-movie-league

python3.11 generate_nft_card.py \
  "nft-assets/portraits/{performer}-portrait.png" \
  "{Performer Name}" \
  "{Performer Type}" \
  "nft-assets/cards/{performer}-card.png"
```

**Step 4: Quality Verification**

```bash
# Visual inspection checklist:
# ✓ Portrait shows head, shoulders, upper torso
# ✓ Name section has dark gray background with white text clearly visible
# ✓ Badges display without visible square backgrounds
# ✓ White border is clean and consistent
# ✓ Card dimensions are 1536 × 2752 pixels
```

**Step 5: S3 Upload and Database Update**

```bash
# Upload to S3
manus-upload-file nft-assets/cards/{performer}-card.png

# Update database with returned CDN URL
# UPDATE performers SET imageUrl = '{cdn_url}' WHERE name = '{Performer Name}';
```

### 3.3 Quality Assurance Process

**Visual Comparison Matrix**

When generating new cards, compare against the reference card using this matrix:

| Element | Reference (Ryan Connor) | New Card | Match? |
|---------|------------------------|----------|--------|
| Portrait framing | Head, shoulders, upper torso | | ☐ |
| Name visibility | Large white text on dark gray | | ☐ |
| Badge transparency | No visible square backgrounds | | ☐ |
| Border consistency | Clean white 20px border | | ☐ |
| Overall layout | 55% portrait, 12% name, 22% badges | | ☐ |

**Browser Testing**

Always verify cards in the actual web application, not just in image viewers. Image viewers may show transparency artifacts (checkered patterns) that don't appear in browsers.

```bash
# Start dev server
cd /home/ubuntu/fantasy-movie-league
pnpm dev

# Navigate to: http://localhost:3000/performers
# Click on performer to view full card
```

---

## 4. Troubleshooting Guide

### 4.1 Common Issues and Solutions

**Issue: Badges Show Gray/Checkered Square Backgrounds**

**Root Cause**: Badge files are in RGB mode instead of RGBA, or the card is created in RGB mode.

**Solution**:
1. Verify badge is RGBA: `python3.11 -c "from PIL import Image; print(Image.open('badge.png').mode)"`
2. If RGB, regenerate badge with proper transparency
3. Verify card generation script uses `Image.new('RGBA', ...)` not `Image.new('RGB', ...)`
4. Apply `fix_badge_background.py` to remove residual backgrounds

**Issue: Name Text Too Small or Invisible**

**Root Cause**: Font size too small (< 150pt) or text color matches background.

**Solution**:
1. Increase font size to 180pt minimum
2. Ensure name section has dark gray background (`#1a1a1a`)
3. Verify text color is white (`#FFFFFF`)
4. Check that name section height is 12% of card height

**Issue: Portrait Doesn't Fit Properly**

**Root Cause**: Portrait aspect ratio doesn't match card proportions.

**Solution**:
1. Generate portrait with vertical orientation (taller than wide)
2. Use `thumbnail()` method instead of `resize()` to preserve aspect ratio
3. Adjust portrait height to 55% of card height
4. Center portrait horizontally within card bounds

### 4.2 Diagnostic Scripts

**Badge Transparency Diagnostic**

```python
# Save as: diagnose_badge.py
from PIL import Image
import numpy as np
import sys

badge_path = sys.argv[1]
img = Image.open(badge_path)

print(f"File: {badge_path}")
print(f"Mode: {img.mode}")
print(f"Size: {img.size}")

if img.mode == 'RGBA':
    alpha = np.array(img)[:,:,3]
    print(f"Transparent pixels: {np.sum(alpha == 0):,}")
    print(f"Opaque pixels: {np.sum(alpha == 255):,}")
    print(f"Semi-transparent: {np.sum((alpha > 0) & (alpha < 255)):,}")
else:
    print("WARNING: Badge is not in RGBA mode!")
```

**Card Validation Script**

```python
# Save as: validate_card.py
from PIL import Image
import sys

card_path = sys.argv[1]
img = Image.open(card_path)

print(f"Card: {card_path}")
print(f"Size: {img.size} (expected: 1536 × 2752)")
print(f"Mode: {img.mode}")

if img.size != (1536, 2752):
    print("❌ FAIL: Incorrect dimensions")
elif img.mode not in ['RGB', 'RGBA']:
    print("❌ FAIL: Invalid color mode")
else:
    print("✅ PASS: Card meets basic specifications")
```

---

## 5. Future Enhancements

### 5.1 Automation Opportunities

**Batch Card Generation**

Create a batch processing script to generate multiple cards in one operation:

```python
# batch_generate_cards.py
performers = [
    {"name": "Veronica Leal", "type": "Rising Star", "portrait": "veronica-leal-portrait.png"},
    {"name": "Jane Wilde", "type": "Girl Next Door", "portrait": "jane-wilde-portrait.png"},
    # ... more performers
]

for performer in performers:
    generate_nft_card(
        f"nft-assets/portraits/{performer['portrait']}",
        performer['name'],
        performer['type'],
        f"nft-assets/cards/{performer['name'].lower().replace(' ', '-')}-card.png"
    )
```

**Automated Quality Checks**

Integrate validation into the generation pipeline:

```python
def generate_and_validate(portrait, name, performer_type, output):
    # Generate card
    generate_nft_card(portrait, name, performer_type, output)
    
    # Validate output
    card = Image.open(output)
    assert card.size == (1536, 2752), "Invalid card dimensions"
    assert card.mode in ['RGB', 'RGBA'], "Invalid color mode"
    
    print(f"✅ Generated and validated: {output}")
```

### 5.2 Template System Enhancement

**Configurable Templates**

Create a configuration file for easy template customization:

```json
{
  "card_dimensions": {
    "width": 1536,
    "height": 2752
  },
  "layout": {
    "portrait_height_percent": 55,
    "name_section_height_percent": 12,
    "badge_area_height_percent": 22
  },
  "colors": {
    "background": "#000000",
    "name_section_background": "#1a1a1a",
    "border": "#FFFFFF",
    "text": "#FFFFFF"
  },
  "typography": {
    "font_family": "DejaVuSans-Bold",
    "font_size": 180
  }
}
```

### 5.3 Badge Management System

**Badge Registry**

Maintain a central registry of all available badges with metadata:

```json
{
  "badges": [
    {
      "id": "rising-star",
      "name": "Rising Star",
      "file": "type-logo-rising-star.png",
      "category": "performer_type",
      "color_scheme": "gold",
      "verified": true,
      "last_validated": "2026-01-19"
    },
    {
      "id": "girl-next-door",
      "name": "Girl Next Door",
      "file": "type-logo-girl-next-door.png",
      "category": "performer_type",
      "color_scheme": "blue",
      "verified": true,
      "last_validated": "2026-01-19"
    }
  ]
}
```

---

## 6. Maintenance Schedule

### 6.1 Regular Maintenance Tasks

**Weekly Tasks**

- Review newly generated cards for consistency with reference card
- Validate badge file integrity (check for corruption or accidental modifications)
- Update badge registry with any new badges added

**Monthly Tasks**

- Audit all performer cards for visual consistency
- Review and update this consistency framework document
- Archive old badge versions (keep `_original` backups)
- Performance review of card generation scripts

**Quarterly Tasks**

- Comprehensive visual audit of all NFT cards
- Update reference card if design standards evolve
- Review and optimize badge file sizes
- Update automation scripts with lessons learned

### 6.2 Version Control

**Badge Versioning**

When updating badge designs, use semantic versioning:

```
type-logo-rising-star-v1.0.png  # Original
type-logo-rising-star-v1.1.png  # Minor update (color adjustment)
type-logo-rising-star-v2.0.png  # Major redesign
```

**Card Template Versioning**

Track changes to the generation script:

```
generate_nft_card.py
# Version 1.0 - Initial implementation
# Version 1.1 - Fixed RGBA mode issue
# Version 1.2 - Added badge transparency validation
# Version 2.0 - Implemented configurable templates
```

---

## 7. Conclusion

Maintaining design consistency across the Porn Star League platform requires systematic processes, clear technical specifications, and regular quality assurance. This framework provides the foundation for consistent NFT card generation while allowing flexibility for future enhancements.

**Key Success Factors**

1. **Technical Precision**: Always use RGBA mode for transparency support
2. **Validation First**: Verify badge transparency before card generation
3. **Reference Comparison**: Compare all new cards against the Ryan Connor reference
4. **Browser Testing**: Always test in the actual web application, not just image viewers
5. **Documentation**: Keep this framework updated as processes evolve

By following these guidelines, the platform can scale to hundreds of performer cards while maintaining the high-quality, professional appearance established by the initial reference card.

---

**Document Revision History**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-19 | Initial framework creation | Manus AI |

---

**Related Resources**

- `generate_nft_card.py` - NFT card generation script
- `fix_badge_transparency.py` - Badge background removal tool
- `fix_badge_background.py` - Circular mask application tool
- `nft-assets/cards/ryan-connor-card.png` - Reference card template
- `client/public/` - Badge asset directory
