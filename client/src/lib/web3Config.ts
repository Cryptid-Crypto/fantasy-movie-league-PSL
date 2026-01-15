import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Configure Wagmi for Polygon network
export const config = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

// Polygon network constants
export const POLYGON_MAINNET_CHAIN_ID = polygon.id;
export const POLYGON_TESTNET_CHAIN_ID = polygonAmoy.id;

// Default to testnet for development
export const DEFAULT_CHAIN_ID = POLYGON_TESTNET_CHAIN_ID;

// Mock NFT contract addresses (replace with actual deployed contracts)
export const NFT_CONTRACT_ADDRESSES = {
  [POLYGON_MAINNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000', // Replace with mainnet address
  [POLYGON_TESTNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000', // Replace with testnet address
};
