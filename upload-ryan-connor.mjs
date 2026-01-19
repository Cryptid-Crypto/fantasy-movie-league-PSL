#!/usr/bin/env node
import { storagePut } from './server/storage.js';
import { readFileSync } from 'fs';

async function uploadAssets() {
  try {
    // Upload portrait
    const portrait = readFileSync('/home/ubuntu/fantasy-movie-league/nft-assets/portraits/ryan-connor-portrait.png');
    const portraitResult = await storagePut('performers/ryan-connor-portrait.png', portrait, 'image/png');
    console.log('✅ Portrait uploaded:', portraitResult.url);
    
    // Upload card
    const card = readFileSync('/home/ubuntu/fantasy-movie-league/nft-assets/cards/ryan-connor-card.png');
    const cardResult = await storagePut('performers/ryan-connor-card.png', card, 'image/png');
    console.log('✅ Card uploaded:', cardResult.url);
    
    console.log('\nURLs for database:');
    console.log('imageUrl:', portraitResult.url);
    console.log('nftCardUrl:', cardResult.url);
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadAssets();
