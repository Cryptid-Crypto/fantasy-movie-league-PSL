import { http, createConfig } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import type { Abi } from 'viem';
import TournamentEscrowAbi from '@/abis/TournamentEscrow.json';
import USDCAbi from '@/abis/USDC.json';

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [injected()],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

export const POLYGON_MAINNET_CHAIN_ID = polygon.id;
export const POLYGON_TESTNET_CHAIN_ID = polygonAmoy.id;
export const DEFAULT_CHAIN_ID = POLYGON_TESTNET_CHAIN_ID;

export const NFT_CONTRACT_ADDRESSES = {
  [POLYGON_MAINNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000',
  [POLYGON_TESTNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000',
};

export const TOURNAMENT_ESCROW_ABI = TournamentEscrowAbi as Abi;
export const TOURNAMENT_ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
  [POLYGON_MAINNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000',
  [POLYGON_TESTNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000',
};

export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [POLYGON_MAINNET_CHAIN_ID]: '0x3c499c54429d6fdea5ed2121d3a1eb9f9cdb5086',
  [POLYGON_TESTNET_CHAIN_ID]: '0x7169D388206D3a326D93F4b1aE8716a34A7B9A3A',
};
export const USDC_ABI = USDCAbi as Abi;

export const PSL_TOKEN_ADDRESSES: Record<number, `0x${string}`> = {
  [POLYGON_MAINNET_CHAIN_ID]: '0xfbCCD389cd47580c4fE4007D86F846B46aDb1fB3',
  [POLYGON_TESTNET_CHAIN_ID]: '0x0000000000000000000000000000000000000000',
};

export const PSL_TOKEN_ABI = [
  { constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], type: 'function' },
  { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], type: 'function' },
  { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], type: 'function' },
  { constant: true, inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], type: 'function' },
  { constant: true, inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], type: 'function' },
  { constant: false, inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], type: 'function' },
  { constant: false, inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], name: 'transfer', outputs: [{ name: '', type: 'bool' }], type: 'function' },
  { constant: true, inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], type: 'function' },
] as const;
