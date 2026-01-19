# NFT Card Generation System

This document explains how to create NFT cards for Porn Star League performers.

## Overview

The NFT card system generates consistent, professional trading cards for all performers with:
- 3D animated portrait (upper 60%)
- Performer name (middle 15%)
- Badge slots for attributes (bottom 25%, 2 rows of 5 = 10 total)

## Card Specifications

- **Dimensions**: 1536x2752 pixels (portrait orientation)
- **Background**: Pure black (#000000)
- **Border**: Thin white border
- **Badge size**: 200x200 pixels
- **Badge spacing**: 50px between badges
- **Bottom margin**: 150px

## Files

### Templates
- `ryan-connor-final-template.png` - Ryan Connor's approved card template (reference for creating new performer portraits)

### Logos (all in `client/public/`)

**Performer Type Badges:**
- `type-logo-legend.png` - Legend (gold crown)
- `type-logo-anal-queen.png` - Anal Queen (purple, peach with crown)
- `type-logo-super-slut.png` - Super Slut (hot pink, double flame)
- `type-logo-extreme.png` - Extreme (red, XXX)
- `type-logo-girl-next-door.png` - Girl Next Door (light blue, smiley flower)
- `type-logo-rising-star.png` - Rising Star (gold, shooting star)
- `type-logo-hall-of-fame.png` - Hall of Fame (silver, Roman column)
- `type-logo-specialist.png` - Specialist (teal, lightning bolt in gear)
- `type-logo-milf.png` - MILF (burgundy, gold high heel)

**Country Badges:**
- `country-logo-usa.png` - USA (silver border, flat flag shield)

### Scripts
- `generate_nft_card.py` - Reusable card generator for any performer

## Creating New Performer Cards

### Step 1: Generate Portrait

Use AI image generation to create a 3D animated Disney/Pixar style portrait following this template:

```
Professional NFT portrait for [PERFORMER NAME]. Portrait orientation showing HEAD, SHOULDERS, and UPPER TORSO. 3D animated Disney/Pixar style. [Physical description: hair color, eye color, body type, signature features]. [Outfit description]. Small white Porn Star League bunny logo (bunny inside diamond frame) on chest. [Tattoos if applicable]. Pure black background. High quality, professional collectible aesthetic.
```

**Key requirements:**
- Show head, shoulders, and upper torso
- Emphasize performer's signature physical features
- Include PSL bunny logo on outfit
- Pure black background
- Save as PNG

### Step 2: Generate Card

Use the `generate_nft_card.py` script:

```bash
python3.11 generate_nft_card.py \
  <portrait_file> \
  "<PERFORMER NAME>" \
  <output_file> \
  [badge1.png] [badge2.png] ...
```

**Example:**
```bash
python3.11 generate_nft_card.py \
  ryan-connor-portrait.png \
  "RYAN CONNOR" \
  ryan-connor-card.png \
  client/public/country-logo-usa.png \
  client/public/type-logo-anal-queen.png \
  client/public/type-logo-milf.png \
  client/public/type-logo-legend.png
```

### Step 3: Verify

Check that:
- [ ] Portrait shows enough of performer's body
- [ ] Name is clearly visible and not overlapping badges
- [ ] Badges are properly sized and spaced
- [ ] PSL logo is visible on outfit
- [ ] All badges use the exact finalized logo files

## Badge Guidelines

### Assigning Badges

Each performer can have up to 10 badges:
1. **Country badge** (1) - Performer's nationality
2. **Primary type** (1) - Main performer category
3. **Secondary types** (0-3) - Additional categories
4. **Special attributes** (0-5) - Achievements, rarities, etc.

### Badge Order

Recommended order:
- Row 1: Country, Primary Type, Secondary Types
- Row 2: Additional attributes, achievements, special tags

## Logo Design Standards

All logos follow the same 3D minimalist style:
- Circular badge with metallic colored border
- Black matte center circle
- 3D icon centered in circle
- No text labels (icon only)
- Transparent background
- 512x512px resolution minimum
- Thick prominent border with depth/shine

## Examples

### Ryan Connor Card
- **Portrait**: Platinum blonde, blue eyes, very large bust, tattoo sleeve
- **Badges**: USA, Anal Queen, MILF, Legend
- **File**: `nft-card-ryan-connor-balanced.png`

## Tips

1. **Portrait consistency**: Use the same AI generation style for all performers
2. **Logo consistency**: Always use the exact finalized logo files, never regenerate
3. **Batch generation**: Create multiple portraits first, then generate all cards
4. **Quality check**: View cards at actual size (1536x2752) before finalizing
5. **Backup**: Keep all portrait source files for future adjustments

## Future Additions

To add new badge types:
1. Generate logo following the design standards above
2. Save to `client/public/` with descriptive name
3. Add to this documentation
4. Update database schema if needed
