import { ethers } from 'ethers';

// ERC-721 ABI (minimal interface for reading NFTs)
const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
];

export interface NFTMetadata {
  tokenId: string;
  contractAddress: string;
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

/**
 * Read all NFTs owned by an address from a specific contract
 */
export async function readUserNFTs(
  walletAddress: string,
  contractAddress: string,
  provider: ethers.Provider
): Promise<NFTMetadata[]> {
  try {
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Get the number of NFTs owned by this address
    const balance = await contract.balanceOf(walletAddress);
    const balanceNum = Number(balance);
    
    if (balanceNum === 0) {
      return [];
    }
    
    // Fetch each token ID
    const nfts: NFTMetadata[] = [];
    for (let i = 0; i < balanceNum; i++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
        const tokenIdStr = tokenId.toString();
        
        // Try to fetch metadata URI
        let metadata: Partial<NFTMetadata> = {};
        try {
          const tokenURI = await contract.tokenURI(tokenId);
          
          // Fetch metadata from URI (could be IPFS or HTTP)
          if (tokenURI) {
            const metadataUrl = tokenURI.startsWith('ipfs://')
              ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
              : tokenURI;
            
            const response = await fetch(metadataUrl);
            if (response.ok) {
              metadata = await response.json();
            }
          }
        } catch (metadataError) {
          console.warn(`Failed to fetch metadata for token ${tokenIdStr}:`, metadataError);
        }
        
        nfts.push({
          tokenId: tokenIdStr,
          contractAddress,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image?.startsWith('ipfs://')
            ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
            : metadata.image,
          attributes: metadata.attributes,
        });
      } catch (tokenError) {
        console.warn(`Failed to fetch token at index ${i}:`, tokenError);
      }
    }
    
    return nfts;
  } catch (error) {
    console.error('Error reading NFTs:', error);
    return [];
  }
}

/**
 * Verify if a wallet owns a specific NFT
 */
export async function verifyNFTOwnership(
  walletAddress: string,
  contractAddress: string,
  tokenId: string,
  provider: ethers.Provider
): Promise<boolean> {
  try {
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    const owner = await contract.ownerOf(tokenId);
    return owner.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    return false;
  }
}
