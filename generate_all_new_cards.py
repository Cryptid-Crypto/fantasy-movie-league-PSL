import subprocess
import json

# Load performer data
with open('/home/ubuntu/generate_performer_portraits.json', 'r') as f:
    data = json.load(f)

# Badge assignments based on research
badge_map = {
    "Angela White": ["country-logo-australia", "type-logo-legend"],
    "Anna Claire Clouds": ["country-logo-usa", "type-logo-rising-star"],
    "Violet Myers": ["country-logo-usa", "type-logo-rising-star"],
    "Abella Danger": ["country-logo-usa", "type-logo-legend"],
    "Riley Reid": ["country-logo-usa", "type-logo-legend"],
    "Lana Rhoades": ["country-logo-usa", "type-logo-legend"],
    "Cherie DeVille": ["country-logo-usa", "type-logo-milf"],
    "Kenna James": ["country-logo-usa", "type-logo-girl-next-door"],
    "Lauren Phillips": ["country-logo-usa", "type-logo-milf"],
    "Gianna Dior": ["country-logo-usa", "type-logo-rising-star"],
    "Blake Blossom": ["country-logo-usa", "type-logo-rising-star"],
    "Leana Lovings": ["country-logo-usa", "type-logo-rising-star"],
    "Octavia Red": ["country-logo-usa", "type-logo-rising-star"],
    "Willow Ryder": ["country-logo-usa", "type-logo-rising-star"],
    "Kendra Lust": ["country-logo-usa", "type-logo-milf"],
    "Mia Malkova": ["country-logo-usa", "type-logo-legend"],
    "Adriana Chechik": ["country-logo-usa", "type-logo-legend"],
    "Cherry Kiss": ["country-logo-serbia", "type-logo-legend"],
}

# Generate cards for all performers
for result in data['results']:
    name = result['output']['performer_name']
    portrait_path = result['output']['portrait_path']
    badges = badge_map.get(name, [])
    
    # Create filename-safe name
    filename = name.lower().replace(' ', '-')
    
    print(f"Generating card for {name}...")
    cmd = [
        'python3.11',
        '/home/ubuntu/fantasy-movie-league/generate_nft_card_v2.py',
        portrait_path,
        name,
        filename,
        *badges
    ]
    
    subprocess.run(cmd)
    print(f"✓ {name} card generated")

print("\n✅ All 18 NFT cards generated successfully!")
