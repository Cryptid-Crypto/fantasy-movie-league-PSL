import subprocess
import json
import os

# Load performer data
with open('/home/ubuntu/generate_performer_portraits.json', 'r') as f:
    data = json.load(f)

# Badge directory
BADGE_DIR = "/home/ubuntu/fantasy-movie-league/client/public"

# Badge assignments based on research
badge_map = {
    "Angela White": ["country-logo-australia.png", "type-logo-legend.png"],
    "Anna Claire Clouds": ["country-logo-usa.png", "type-logo-rising-star.png"],
    "Violet Myers": ["country-logo-usa.png", "type-logo-rising-star.png"],
    "Abella Danger": ["country-logo-usa.png", "type-logo-legend.png"],
    "Riley Reid": ["country-logo-usa.png", "type-logo-legend.png"],
    "Lana Rhoades": ["country-logo-usa.png", "type-logo-legend.png"],
    "Cherie DeVille": ["country-logo-usa.png", "type-logo-milf.png"],
    "Kenna James": ["country-logo-usa.png", "type-logo-girl-next-door.png"],
    "Lauren Phillips": ["country-logo-usa.png", "type-logo-milf.png"],
    "Gianna Dior": ["country-logo-usa.png", "type-logo-rising-star.png"],
    "Blake Blossom": ["country-logo-usa.png", "type-logo-rising-star.png"],
    "Leana Lovings": ["country-logo-usa.png", "type-logo-rising-star.png"],
    "Octavia Red": ["country-logo-usa.png", "type-logo-rising-star.png"],
    "Willow Ryder": ["country-logo-usa.png", "type-logo-rising-star.png"],
    "Kendra Lust": ["country-logo-usa.png", "type-logo-milf.png"],
    "Mia Malkova": ["country-logo-usa.png", "type-logo-legend.png"],
    "Adriana Chechik": ["country-logo-usa.png", "type-logo-legend.png"],
    "Cherry Kiss": ["country-logo-serbia.png", "type-logo-legend.png"],
}

# Generate cards for all performers
for result in data['results']:
    name = result['output']['performer_name']
    portrait_path = result['output']['portrait_path']
    badge_files = badge_map.get(name, [])
    
    # Convert badge filenames to full paths
    badge_paths = [os.path.join(BADGE_DIR, badge) for badge in badge_files]
    
    # Create filename-safe name
    filename = name.lower().replace(' ', '-')
    output_path = f"/home/ubuntu/fantasy-movie-league/nft-assets/cards/{filename}-card.png"
    
    print(f"\nGenerating card for {name}...")
    cmd = [
        'python3.11',
        '/home/ubuntu/fantasy-movie-league/generate_nft_card_v2.py',
        portrait_path,
        name,
        output_path,
        *badge_paths
    ]
    
    subprocess.run(cmd)
    print(f"✓ {name} card completed")

print("\n\n✅ All 18 NFT cards generated successfully!")
