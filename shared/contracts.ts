// Smart Contract Addresses and ABIs for Polygon Network

// Polygon Mainnet Contract Addresses
export const POLYGON_MAINNET_CONTRACTS = {
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  PSL_TOKEN: '',
  CARD_PACK_SALE: '',
  TOURNAMENT_POOL: '',
  NFT_CARDS: '',
};

// Card Pack Pricing (in USDC, 6 decimals)
export const CARD_PACK_PRICES = {
  PACK_5: 5_000000,
  PACK_10: 9_000000,
  PACK_20: 16_000000,
};

// ERC-20 ABI
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

export function formatUSDC(amount: bigint): string {
  const dollars = Number(amount) / 1_000000;
  return `$${dollars.toFixed(2)}`;
}
