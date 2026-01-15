# Performer NFT Smart Contract Documentation

## Overview

The **PerformerNFT** contract is an ERC-721 NFT implementation with ERC-2981 royalty support, designed specifically for the Fantasy Movie League platform on Polygon Network. Each contract represents a unique performer, and NFT holders can use their tokens to enter tournaments and compete based on the performer's scene performance data.

## Contract Features

### Core Functionality

- **ERC-721 Compliance**: Standard NFT functionality with ownership transfer, approval, and metadata
- **ERC-2981 Royalty Standard**: Built-in royalty support for secondary market sales
- **Metadata Storage**: On-chain token URI storage for performer information
- **Access Control**: Owner-only administrative functions
- **Minting Controls**: Configurable max supply, mint price, and minting status

### Key Components

1. **Performer Metadata**
   - `performerName`: The name of the performer this NFT collection represents
   - `performerBio`: Short biography or description of the performer

2. **Supply Management**
   - `maxSupply`: Maximum number of NFTs that can be minted
   - `totalSupply()`: Current number of minted NFTs
   - Prevents over-minting beyond max supply

3. **Minting Configuration**
   - `mintPrice`: Price in MATIC (wei) required to mint one NFT
   - `mintingEnabled`: Boolean flag to enable/disable public minting
   - `mint()`: Public minting function (requires payment)
   - `batchMint()`: Owner-only batch minting for initial distribution

4. **Royalty System (ERC-2981)**
   - Default royalty configuration for all tokens
   - Per-token royalty override capability
   - Royalty receiver address and fee percentage (basis points)

## Deployment Guide

### Prerequisites

- Node.js v16+ and npm/yarn
- Hardhat or Foundry development environment
- Polygon RPC endpoint (Alchemy, Infura, or QuickNode)
- Wallet with MATIC for gas fees

### Installation

```bash
npm install --save-dev hardhat @openzeppelin/contracts
npm install --save-dev @nomiclabs/hardhat-ethers ethers
```

### Deployment Script Example

```javascript
// scripts/deploy-performer-nft.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying PerformerNFT with account:", deployer.address);
  
  // Deployment parameters
  const performerName = "Jane Doe";
  const performerBio = "Award-winning performer with 10+ years experience";
  const maxSupply = 1000;
  const mintPrice = hre.ethers.parseEther("0.1"); // 0.1 MATIC
  const royaltyReceiver = deployer.address; // Or specific royalty wallet
  const royaltyFeeNumerator = 250; // 2.5% royalty (250 basis points)
  
  const PerformerNFT = await hre.ethers.getContractFactory("PerformerNFT");
  const performerNFT = await PerformerNFT.deploy(
    performerName,
    performerBio,
    maxSupply,
    mintPrice,
    royaltyReceiver,
    royaltyFeeNumerator
  );
  
  await performerNFT.waitForDeployment();
  
  console.log("PerformerNFT deployed to:", await performerNFT.getAddress());
  console.log("Performer:", performerName);
  console.log("Max Supply:", maxSupply);
  console.log("Mint Price:", hre.ethers.formatEther(mintPrice), "MATIC");
  console.log("Royalty:", royaltyFeeNumerator / 100, "%");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Hardhat Configuration

```javascript
// hardhat.config.js
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 137
    },
    polygonMumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 80001
    }
  }
};
```

### Deploy to Polygon

```bash
# Test deployment on Mumbai testnet
npx hardhat run scripts/deploy-performer-nft.js --network polygonMumbai

# Production deployment on Polygon mainnet
npx hardhat run scripts/deploy-performer-nft.js --network polygon
```

## Integration with Fantasy Movie League Platform

### 1. Contract Address Registration

After deploying a PerformerNFT contract, register it in the platform database:

```sql
UPDATE performers 
SET nft_contract_address = '0x...' 
WHERE id = [performer_id];
```

### 2. Reading User NFTs

The platform uses the `tokensOfOwner()` function to retrieve all NFT token IDs owned by a user:

```javascript
const contract = new ethers.Contract(contractAddress, abi, provider);
const tokenIds = await contract.tokensOfOwner(userAddress);
```

### 3. Tournament Entry Validation

When a user enters a tournament:
1. Platform checks if user owns at least one NFT from the required contract
2. User selects which NFT token to compete with
3. Platform records the entry with `performerId`, `nftTokenId`, and `contractAddress`

### 4. Metadata Structure

Token metadata should follow this JSON structure:

```json
{
  "name": "Jane Doe #42",
  "description": "Performer NFT for Fantasy Movie League tournaments",
  "image": "ipfs://QmXxx.../42.png",
  "attributes": [
    {
      "trait_type": "Performer",
      "value": "Jane Doe"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Edition",
      "value": "Genesis"
    }
  ]
}
```

## Contract Functions Reference

### Public Functions

| Function | Parameters | Description |
|----------|-----------|-------------|
| `mint(address to, string uri)` | `to`: recipient address<br>`uri`: metadata URI | Mint a new NFT (requires payment) |
| `totalSupply()` | None | Returns total number of minted NFTs |
| `tokensOfOwner(address owner)` | `owner`: wallet address | Returns array of token IDs owned by address |
| `tokenURI(uint256 tokenId)` | `tokenId`: NFT token ID | Returns metadata URI for token |
| `royaltyInfo(uint256 tokenId, uint256 salePrice)` | `tokenId`: NFT token ID<br>`salePrice`: sale price in wei | Returns royalty receiver and amount (ERC-2981) |

### Owner-Only Functions

| Function | Parameters | Description |
|----------|-----------|-------------|
| `batchMint(address to, uint256 amount, string baseUri)` | `to`: recipient<br>`amount`: quantity<br>`baseUri`: metadata base URI | Mint multiple NFTs at once |
| `setMintingEnabled(bool enabled)` | `enabled`: true/false | Enable or disable public minting |
| `setMintPrice(uint256 newPrice)` | `newPrice`: price in wei | Update mint price |
| `setDefaultRoyalty(address receiver, uint96 feeNumerator)` | `receiver`: royalty recipient<br>`feeNumerator`: fee in basis points | Set default royalty for all tokens |
| `setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)` | `tokenId`: specific token<br>`receiver`: royalty recipient<br>`feeNumerator`: fee in basis points | Set royalty for specific token |
| `withdraw()` | None | Withdraw contract balance to owner |

## Royalty Configuration

The contract implements ERC-2981 for standardized royalty payments on secondary sales. Royalty fees are specified in **basis points** (1 basis point = 0.01%):

- **250 basis points** = 2.5%
- **500 basis points** = 5%
- **1000 basis points** = 10%

Example royalty calculation:
```
Sale Price: 1 MATIC
Royalty Fee: 250 basis points (2.5%)
Royalty Amount: 0.025 MATIC
```

## Security Considerations

1. **Access Control**: Only the contract owner can perform administrative functions
2. **Reentrancy Protection**: Uses OpenZeppelin's battle-tested implementations
3. **Supply Cap**: Max supply is immutable after deployment
4. **Payment Validation**: Mint function requires exact or higher payment
5. **Safe Transfers**: Uses `_safeMint` to prevent NFT loss to non-receiver contracts

## Testing

Example test cases to implement:

```javascript
describe("PerformerNFT", function () {
  it("Should mint NFT with correct payment", async function () {
    // Test minting with exact mint price
  });
  
  it("Should reject minting when disabled", async function () {
    // Test minting control toggle
  });
  
  it("Should enforce max supply", async function () {
    // Test supply cap enforcement
  });
  
  it("Should calculate royalties correctly", async function () {
    // Test ERC-2981 royalty calculation
  });
  
  it("Should return correct tokens for owner", async function () {
    // Test tokensOfOwner function
  });
});
```

## Gas Optimization Tips

1. Use batch minting for initial distribution to save gas
2. Store metadata on IPFS and only store CID on-chain
3. Consider lazy minting for large collections
4. Use ERC-721A for gas-efficient batch minting (alternative implementation)

## Support & Resources

- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **ERC-721 Standard**: https://eips.ethereum.org/EIPS/eip-721
- **ERC-2981 Royalty Standard**: https://eips.ethereum.org/EIPS/eip-2981
- **Polygon Network**: https://polygon.technology/
- **Hardhat Documentation**: https://hardhat.org/docs

## License

MIT License - See contract SPDX identifier for details.
