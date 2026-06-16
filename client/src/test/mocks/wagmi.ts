/**
 * @fileoverview Comprehensive wagmi v2 hook mocks for testing.
 *
 * Provides configurable mock implementations of all wagmi hooks used
 * throughout the pornstarleague.com client:
 *   - useAccount
 *   - useConnect
 *   - useDisconnect
 *   - useBalance (ETH + PSL token)
 *   - useSwitchChain
 *
 * Usage:
 *   import { mockUseAccount, mockUseConnect, ... } from '@/test/mocks/wagmi';
 *   mockUseAccount.mockReturnValue({ ... });
 *
 * @module test/mocks/wagmi
 */
import { vi } from 'vitest';

// ─── Mock Connectors ─────────────────────────────────────────────────────────

/**
 * Creates a mock connector object that mirrors the wagmi Connector interface.
 * @param overrides - Partial overrides for the connector fields
 */
export function createMockConnector(overrides: Partial<MockConnector> = {}): MockConnector {
  return {
    id: 'injected',
    name: 'MetaMask',
    type: 'injected',
    uid: 'mock-uid-injected',
    ...overrides,
  };
}

export interface MockConnector {
  id: string;
  name: string;
  type: string;
  uid: string;
}

/** Pre-built connector set: MetaMask (injected) + WalletConnect */
export const mockConnectors: MockConnector[] = [
  createMockConnector({ id: 'injected', name: 'MetaMask', type: 'injected' }),
  createMockConnector({
    id: 'walletConnect',
    name: 'WalletConnect',
    type: 'walletConnect',
    uid: 'mock-uid-walletconnect',
  }),
];

// ─── Common Test Addresses / Chains ──────────────────────────────────────────

export const MOCK_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`;
export const MOCK_ADDRESS_2 = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
export const MOCK_ENS_NAME = 'vitalik.eth';

export const POLYGON_CHAIN = {
  id: 137,
  name: 'Polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: { default: { http: ['https://polygon-rpc.com'] } },
};

export const POLYGON_AMOY_CHAIN = {
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc-amoy.polygon.technology'] } },
};

export const ETHEREUM_CHAIN = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://cloudflare-eth.com'] } },
};

// ─── Mock Hook Implementations ───────────────────────────────────────────────

/**
 * Mock for wagmi's `useAccount` hook.
 * Default: disconnected state. Override with `.mockReturnValue()`.
 */
export const mockUseAccount = vi.fn().mockReturnValue({
  address: undefined,
  addresses: undefined,
  chain: undefined,
  connector: undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  isReconnecting: false,
  status: 'disconnected',
});

/**
 * Mock for wagmi's `useConnect` hook.
 * Default: idle state with MetaMask + WalletConnect connectors.
 */
export const mockConnectFn = vi.fn();
export const mockUseConnect = vi.fn().mockReturnValue({
  connect: mockConnectFn,
  connectors: mockConnectors,
  data: undefined,
  error: null,
  isError: false,
  isIdle: true,
  isLoading: false,
  isSuccess: false,
  isPending: false,
  reset: vi.fn(),
  status: 'idle',
  variables: undefined,
});

/**
 * Mock for wagmi's `useDisconnect` hook.
 */
export const mockDisconnectFn = vi.fn();
export const mockUseDisconnect = vi.fn().mockReturnValue({
  disconnect: mockDisconnectFn,
  isError: false,
  isIdle: true,
  isLoading: false,
  isSuccess: false,
  error: null,
  status: 'idle',
});

/**
 * Mock for wagmi's `useBalance` hook.
 * Default: 1.5 MATIC balance.
 */
export const mockUseBalance = vi.fn().mockReturnValue({
  data: {
    value: BigInt('1500000000000000000'), // 1.5 MATIC
    decimals: 18,
    formatted: '1.5',
    symbol: 'MATIC',
  },
  isError: false,
  isLoading: false,
  isSuccess: true,
  error: null,
  status: 'success',
});

/**
 * Mock for wagmi's `useSwitchChain` hook.
 */
export const mockSwitchChainFn = vi.fn();
export const mockUseSwitchChain = vi.fn().mockReturnValue({
  switchChain: mockSwitchChainFn,
  chains: [POLYGON_CHAIN, POLYGON_AMOY_CHAIN],
  data: undefined,
  error: null,
  isError: false,
  isIdle: true,
  isLoading: false,
  isSuccess: false,
  isPending: false,
  status: 'idle',
  reset: vi.fn(),
});

/**
 * Mock for wagmi's `useChainId` hook.
 */
export const mockUseChainId = vi.fn().mockReturnValue(80002);

/**
 * Mock for wagmi's `useReadContract` hook (for ERC-20 reads like PSL balance).
 * Default: returns no data (undefined).
 */
export const mockUseReadContract = vi.fn().mockReturnValue({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  isPending: false,
  isSuccess: false,
  refetch: vi.fn(),
  status: 'idle',
});

/**
 * Mock for wagmi's `useEnsName` hook (bonus: ENS resolution).
 */
export const mockUseEnsName = vi.fn().mockReturnValue({
  data: null,
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: false,
});

// ─── Helper: Build a "connected" state for useAccount ────────────────────────

/**
 * Returns a connected account state for useAccount.
 * Use this to configure the mock for a connected wallet scenario.
 */
export function connectedAccountState(overrides: Record<string, unknown> = {}) {
  return {
    address: MOCK_ADDRESS,
    addresses: [MOCK_ADDRESS],
    chain: POLYGON_AMOY_CHAIN,
    connector: mockConnectors[0],
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    isReconnecting: false,
    status: 'connected',
    ...overrides,
  };
}

/**
 * Returns a connecting state for useAccount.
 */
export function connectingAccountState(overrides: Record<string, unknown> = {}) {
  return {
    address: undefined,
    addresses: undefined,
    chain: undefined,
    connector: undefined,
    isConnected: false,
    isConnecting: true,
    isDisconnected: false,
    isReconnecting: false,
    status: 'connecting',
    ...overrides,
  };
}
