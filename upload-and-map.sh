#!/bin/bash

# Batch 3 performers (41-60)
declare -a batch3=("haley-reed" "ivy-lebelle" "jada-stevens" "jia-lissa" "joanna-angel" "kali-roses" "karlee-grey" "katrina-jade" "kayley-gunner" "kendra-lust" "kendra-sunderland" "kenzie-anne" "kenzie-reeves" "kenzie-taylor" "kira-noir" "kylie-rocket" "lacy-lennon" "lana-rhoades" "lena-paul" "lexi-luna")

# Batch 4 performers (61-80)
declare -a batch4=("little-caprice" "luna-star" "lulu-chu" "maitland-ward" "mia-malkova" "mia-melano" "molly-little" "nicole-aniston" "payton-preslee" "phoenix-marie" "piper-perri" "rachel-starr" "riley-reid" "riley-steele" "ryan-reid" "savannah-bond" "scarlett-alexis" "scarlit-scandal" "skye-blue" "sophia-leone")

# Batch 5 performers (81-100)
declare -a batch5=("stella-cox" "sweetie-fox" "syren-de-mer" "teanna-trump" "tori-black" "valentina-nappi" "valerica-steele" "vanessa-sky" "vanna-bardot" "veronica-leal" "violet-myers" "violet-starr" "vixen-vogel" "willow-ryder" "xxlayna-marie" "zoey-monroe" "alexis-fawx" "asa-akira" "brandi-love" "jessa-rhodes")

# Batch 6 performers (101-102)
declare -a batch6=("kelsi-monroe" "romi-rain")

cd /home/ubuntu/fantasy-movie-league

# Upload batch 3
echo "Uploading batch 3..."
for slug in "${batch3[@]}"; do
  url=$(manus-upload-file "batch3-clean-skin/${slug}.png" 2>&1 | grep -o 'https://[^ ]*')
  echo "UPDATE performers SET imageUrl = '$url' WHERE slug = '$slug';" >> batch3-6-updates.sql
done

# Upload batch 4
echo "Uploading batch 4..."
for slug in "${batch4[@]}"; do
  url=$(manus-upload-file "batch4-clean-skin/${slug}.png" 2>&1 | grep -o 'https://[^ ]*')
  echo "UPDATE performers SET imageUrl = '$url' WHERE slug = '$slug';" >> batch3-6-updates.sql
done

# Upload batch 5
echo "Uploading batch 5..."
for slug in "${batch5[@]}"; do
  url=$(manus-upload-file "batch5-clean-skin/${slug}.png" 2>&1 | grep -o 'https://[^ ]*')
  echo "UPDATE performers SET imageUrl = '$url' WHERE slug = '$slug';" >> batch3-6-updates.sql
done

# Upload batch 6
echo "Uploading batch 6..."
for slug in "${batch6[@]}"; do
  url=$(manus-upload-file "batch6-clean-skin/${slug}.png" 2>&1 | grep -o 'https://[^ ]*')
  echo "UPDATE performers SET imageUrl = '$url' WHERE slug = '$slug';" >> batch3-6-updates.sql
done

echo "All uploads complete!"
wc -l batch3-6-updates.sql
