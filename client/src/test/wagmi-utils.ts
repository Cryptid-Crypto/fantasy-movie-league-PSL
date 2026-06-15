/**
 * @fileoverview Wagmi v2 test utilities for pornstarleague.com.
 *
 * Provides helper functions and wrapper components for testing wallet-connected
 * UI components without requiring a live blockchain or browser extension.
 *
 * Includes:
 *   - MockMetaMaskConnector: simulates MetaMask injected connector
 *   - MockWalletConnectConnector: simulates WalletConnect
 *   - renderWithWagmi: wraps a component in a WagmiProvider for testing
 *   - setupConnectedWallet / setupDisconnectedWallet: quick state helpers
 *
 * @module test/wagmi-utils
 */
import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import {
  mockUseAccount,
  mockUseConnect,
  mockUseDisconnect,
  mockUseBalance,
  mockUseSwitchChain,
  connectedAccountState,
  connectingAccountState,
  MOCK_ADDRESS,
  MOCK_ADDRESS_2,
  POLYGON_CHAIN,
  POLYGON_AMOY_CHAIN,
  mockConnectFn,
  mockDisconnectFn,
  mockSwitchChainFn,
  mockConnectors,
} from './mocks/wagmi';

// ─── Mock Connector Definitions ──────────────────────────────────────────────

/**
 * Simulates a MetaMask injected connector for testing.
 * This mirrors the structure of wagmi's injected() connector.
 */
export const MockMetaMaskConnector = {
  id: 'injected',
  name: 'MetaMask',
  type: 'injected',
  uid: 'mock-injected-metamask',
  /** Simulate a successful connection */
  connect: () => ({
    accounts: [MOCK_ADDRESS],
    chainId: 80002,
  }),
};

/**
 * Simulates a WalletConnect connector for testing.
 * In production this would open a QR code modal; here it returns mock data.
 */
export const MockWalletConnectConnector = {
  id: 'walletConnect',
  name: 'WalletConnect',
  type: 'walletConnect',
  uid: 'mock-walletconnect',
  connect: () => ({
    accounts: [MOCK_ADDRESS],
    chainId: 80002,
  }),
};

// ─── State Configuration Helpers ─────────────────────────────────────────────

/**
 * Configures all wagmi mocks to simulate a connected wallet on Polygon Amoy.
 *
 * @param options.address - Override the connected address
 * @param options.chain - Override the connected chain
 * @param options.balance - Override the MATIC balance (in wei as bigint)
 */
export function setupConnectedWallet(options: {
  address?: `0x${string}`;
  chain?: typeof POLYGON_CHAIN | typeof POLYGON_AMOY_CHAIN;
  balance?: bigint;
} = {}): void {
  const address = options.address ?? MOCK_ADDRESS;
  const chain = options.chain ?? POLYGON_AMOY_CHAIN;
  const balance = options.balance ?? BigInt('1500000000000000000');

  mockUseAccount.mockReturnValue(connectedAccountState({ address, chain }));
  mockUseBalance.mockReturnValue({
    data: {
      value: balance,
      decimals: 18,
      formatted: (Number(balance) / 1e18).toString(),
      symbol: 'MATIC',
    },
    isError: false,
    isLoading: false,
    isSuccess: true,
    error: null,
    status: 'success',
  });
  mockUseConnect.mockReturnValue({
    connect: mockConnectFn,
    connectors: mockConnectors,
    data: { accounts: [address], chainId: chain.id },
    error: null,
    isError: false,
    isIdle: false,
    isLoading: false,
    isSuccess: true,
    isPending: false,
    reset: vi.fn(),
    status: 'success',
    variables: undefined,
  });
}

/**
 * Configures all wagmi mocks to simulate a disconnected wallet.
 * Resets connect/disconnect mocks to their idle state.
 */
export function setupDisconnectedWallet(): void {
  mockUseAccount.mockReturnValue({
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
  mockUseBalance.mockReturnValue({
    data: undefined,
    isError: false,
    isLoading: false,
    isSuccess: false,
    error: null,
    status: 'pending',
  });
  mockUseConnect.mockReturnValue({
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
}

/**
 * Configures all wagmi mocks to simulate a wallet in the process of connecting.
 */
export function setupConnectingWallet(): void {
  mockUseAccount.mockReturnValue(connectingAccountState());
  mockUseConnect.mockReturnValue({
    connect: mockConnectFn,
    connectors: mockConnectors,
    data: undefined,
    error: null,
    isError: false,
    isIdle: false,
    isLoading: true,
    isSuccess: false,
    isPending: true,
    reset: vi.fn(),
    status: 'pending',
    variables: undefined,
  });
}

/**
 * Configures wagmi mocks to simulate a connection error (e.g., user rejected).
 */
export function setupConnectionError(message = 'User rejected the request'): void {
  mockUseAccount.mockReturnValue({
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
  mockUseConnect.mockReturnValue({
    connect: mockConnectFn,
    connectors: mockConnectors,
    data: undefined,
    error: new Error(message),
    isError: true,
    isIdle: false,
    isLoading: false,
    isSuccess: false,
    isPending: false,
    reset: vi.fn(),
    status: 'error',
    variables: undefined,
  });
}

// ─── Render Wrapper ──────────────────────────────────────────────────────────

/**
 * A minimal wrapper provider for rendering components that use wagmi hooks.
 * Since we mock the hooks at module level, this wrapper just provides any
 * additional context the component might need (e.g., sonner toast container).
 */
function WagmiTestWrapper({ children }: { children: ReactNode }) {
  return React.createElement('div', { 'data-testid': 'wagmi-test-wrapper' }, children);
}

/**
 * Custom render function that wraps components with wagmi test providers.
 * Use this instead of the default `render` from @testing-library/react
 * when testing components that consume wagmi hooks.
 *
 * @param ui - The React element to render
 * @param options - Additional render options to merge
 * @returns Testing Library render result
 *
 * @example
 * ```ts
 * renderWithWagmi(<WalletConnect />);
 * expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
 * ```
 */
export function renderWithWagmi(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: WagmiTestWrapper, ...options });
}
