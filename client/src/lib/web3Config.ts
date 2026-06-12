import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import type { Abi } from 'viem';
import TournamentEscrowAbi from '@/abis/TournamentEscrow.json';
import USDCAbi from '@/abis/USDC.json';

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

// TournamentEscrow contract ABI (see contracts/TournamentEscrow.sol)
export const TOURNAMENT_ESCROW_ABI = TournamentEscrowAbi as Abi;

// TournamentEscrow deployed contract addresses per chain.
// TODO: Replace the zero addresses with the real deployed contract
// addresses once TournamentEscrow is deployed to each network.
export const TOURNAMENT_ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
  [POLYGON_MAINNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000', // TODO: mainnet (Polygon) deployment
  [POLYGON_TESTNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000', // TODO: testnet (Amoy) deployment
};

// USDC contract addresses on Polygon
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [POLYGON_MAINNET_CHAIN_ID]: '0x3c499c54429d6fdea5ed2121d3a1eb9f9cdb5086', // Polygon USDC
  [POLYGON_TESTNET_CHAIN_ID]: '0x7169D388206D3a326D93F4b1aE8716a34A7B9A3A', // Amoy testnet USDC
};

// USDC ABI
export const USDC_ABI = USDCAbi as Abi;
