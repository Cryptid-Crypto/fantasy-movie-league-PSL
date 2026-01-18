import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Configure chains - use Polygon mainnet and Amoy testnet
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

// Helper to format addresses
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to format token amounts
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmed = fractionStr.replace(/0+$/, '');
  return `${whole}.${trimmed}`;
}

// Helper to parse token amounts to wei
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
