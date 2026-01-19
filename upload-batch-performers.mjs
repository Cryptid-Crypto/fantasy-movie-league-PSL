import { storagePut } from "./server/storage.js";
import { readFileSync } from "fs";

const performers = [
  {
    name: "Veronica Leal",
    slug: "veronica-leal",
    type: "Rising Star",
    nationality: "Colombian",
    bio: "Colombian sensation Veronica Leal brings explosive energy and athletic prowess to every performance. Known for her platinum blonde hair, tanned complexion, and fearless approach to extreme content."
  },
  {
    name: "Jane Wilde",
    slug: "jane-wilde",
    type: "Girl Next Door",
    nationality: "American",
    bio: "Petite powerhouse Jane Wilde combines girl-next-door charm with an insatiable appetite for intense performances. Her natural beauty and fearless attitude have made her a fan favorite."
  },
  {
    name: "Nicole Kitt",
    slug: "nicole-kitt",
    type: "Rising Star",
    nationality: "American",
    bio: "Stunning African American performer Nicole Kitt captivates with her athletic curves, natural beauty, and confident sultry presence. A rising star making waves in the industry."
  },
  {
    name: "Millie Morgan",
    slug: "millie-morgan",
    type: "Girl Next Door",
    nationality: "American",
    bio: "Sweet and sensual Millie Morgan embodies the girl-next-door fantasy with her honey blonde hair, bright smile, and natural charm. Her fresh-faced beauty and genuine enthusiasm shine through."
  },
  {
    name: "Chanel Camryn",
    slug: "chanel-camryn",
    type: "Girl Next Door",
    nationality: "American",
    bio: "Delicate beauty Chanel Camryn brings youthful innocence and natural allure to her performances. Her platinum blonde hair and petite frame make her an instant standout."
  },
  {
    name: "Gal Ritchie",
    slug: "gal-ritchie",
    type: "Rising Star",
    nationality: "American",
    bio: "Sultry and sophisticated Gal Ritchie commands attention with her dark features, confident presence, and classic beauty. A rising talent with undeniable star power."
  }
];

async function uploadPerformers() {
  console.log("🚀 Starting batch upload of 6 performers...\n");
  
  const results = [];
  
  for (const performer of performers) {
    console.log(`📤 Uploading ${performer.name}...`);
    
    try {
      // Upload portrait
      const portraitPath = `nft-assets/portraits/${performer.slug}-portrait.png`;
      const portraitBuffer = readFileSync(portraitPath);
      const portraitResult = await storagePut(
        `performers/${performer.slug}-portrait.png`,
        portraitBuffer,
        "image/png"
      );
      console.log(`  ✓ Portrait uploaded: ${portraitResult.url}`);
      
      // Upload card
      const cardPath = `nft-assets/cards/${performer.slug}-card.png`;
      const cardBuffer = readFileSync(cardPath);
      const cardResult = await storagePut(
        `performers/${performer.slug}-card.png`,
        cardBuffer,
        "image/png"
      );
      console.log(`  ✓ Card uploaded: ${cardResult.url}`);
      
      results.push({
        ...performer,
        portraitUrl: portraitResult.url,
        cardUrl: cardResult.url
      });
      
      console.log(`✅ ${performer.name} upload complete!\n`);
    } catch (error) {
      console.error(`❌ Error uploading ${performer.name}:`, error.message);
    }
  }
  
  // Save results to file for database insertion
  const fs = await import("fs/promises");
  await fs.writeFile(
    "performer-upload-results.json",
    JSON.stringify(results, null, 2)
  );
  
  console.log("🎉 All uploads complete!");
  console.log(`📄 Results saved to: performer-upload-results.json`);
  
  return results;
}

uploadPerformers().catch(console.error);
