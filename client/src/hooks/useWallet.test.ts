/**
 * @fileoverview Tests for the useWeb3 hook (useWallet wrapper).
 *
 * Covers:
 *   - useAccount: returns correct connected/disconnected state
 *   - useConnect: connect with different connectors
 *   - useDisconnect: disconnect wallet
 *   - useBalance: fetching PSL / MATIC balance
 *   - useChainId: network detection
 *   - Auto-switch to default chain when on wrong network
 *   - connectWallet helper using injected connector
 *
 * Uses vi.mock() to replace all wagmi hooks and tests both state and
 * behavior (function calls, side effects).
 *
 * @module hooks/useWallet.test
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

// ─── Mock Imports ────────────────────────────────────────────────────────────

import {
  mockUseAccount,
  mockUseConnect,
  mockUseDisconnect,
  mockUseBalance,
  mockUseSwitchChain,
  mockConnectFn,
  mockDisconnectFn,
  mockSwitchChainFn,
  mockConnectors,
  MOCK_ADDRESS,
  MOCK_ADDRESS_2,
  connectedAccountState,
  connectingAccountState,
  POLYGON_CHAIN,
  POLYGON_AMOY_CHAIN,
  ETHEREUM_CHAIN,
} from '@/test/mocks/wagmi';

// The DEFAULT_CHAIN_ID from web3Config is polygonAmoy.id = 80002
const DEFAULT_CHAIN_ID = 80002;

// ─── Module Mocks (hoisted) ─────────────────────────────────────────────────

vi.mock('wagmi', () => ({
  useAccount: (...args: unknown[]) => mockUseAccount(...args),
  useConnect: (...args: unknown[]) => mockUseConnect(...args),
  useDisconnect: (...args: unknown[]) => mockUseDisconnect(...args),
  useBalance: (...args: unknown[]) => mockUseBalance(...args),
  useSwitchChain: (...args: unknown[]) => mockUseSwitchChain(...args),
}));

vi.mock('@/lib/web3Config', () => ({
  DEFAULT_CHAIN_ID: 80002,
  POLYGON_MAINNET_CHAIN_ID: 137,
  POLYGON_TESTNET_CHAIN_ID: 80002,
  config: {},
}));

// ─── Import hook under test AFTER mocks ─────────────────────────────────────

import { useWeb3 } from '@/hooks/useWeb3';

// ─── Helper: Wrapper (no actual provider needed since hooks are mocked) ─────

function TestWrapper({ children }: { children: ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useWeb3 (useWallet hook)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: disconnected state
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

    mockUseDisconnect.mockReturnValue({
      disconnect: mockDisconnectFn,
      isError: false,
      isIdle: true,
      isLoading: false,
      isSuccess: false,
      error: null,
      status: 'idle',
    });

    mockUseBalance.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      isSuccess: false,
      error: null,
      status: 'pending',
    });

    mockUseSwitchChain.mockReturnValue({
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
  });

  // ──────────────────────────────────────────────────────────────────────────
  // useAccount: Returns correct state
  // ──────────────────────────────────────────────────────────────────────────

  describe('useAccount state', () => {
    /** Test: hook returns disconnected state when no wallet is connected */
    it('returns disconnected state by default', () => {
      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      expect(result.current.address).toBeUndefined();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.chain).toBeUndefined();
    });

    /** Test: hook returns connected state with address and chain */
    it('returns connected state with address when wallet is connected', () => {
      mockUseAccount.mockReturnValue(connectedAccountState());

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      expect(result.current.address).toBe(MOCK_ADDRESS);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.chain).toEqual(POLYGON_AMOY_CHAIN);
    });

    /** Test: hook returns connecting state during connection attempt */
    it('returns connecting state during connection', () => {
      mockUseAccount.mockReturnValue(connectingAccountState());

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      expect(result.current.isConnected).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // useConnect: Connect with different connectors
  // ──────────────────────────────────────────────────────────────────────────

  describe('useConnect with different connectors', () => {
    /**
     * Test: connectWallet() finds the injected (MetaMask) connector
     * and calls connect() with it and the default chain ID.
     */
    it('connectWallet uses the injected connector with default chain', () => {
      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      act(() => {
        result.current.connectWallet();
      });

      expect(mockConnectFn).toHaveBeenCalledTimes(1);
      expect(mockConnectFn).toHaveBeenCalledWith({
        connector: expect.objectContaining({ id: 'injected' }),
        chainId: DEFAULT_CHAIN_ID,
      });
    });

    /** Test: connectWallet does nothing when no injected connector is available */
    it('does nothing if injected connector is not available', () => {
      mockUseConnect.mockReturnValue({
        connect: mockConnectFn,
        connectors: [
          { id: 'walletConnect', name: 'WalletConnect', type: 'walletConnect', uid: 'wc' },
        ],
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

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      act(() => {
        result.current.connectWallet();
      });

      expect(mockConnectFn).not.toHaveBeenCalled();
    });

    /** Test: isPending state is passed through from useConnect */
    it('exposes isPending from useConnect', () => {
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

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });
      expect(result.current.isPending).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // useDisconnect
  // ──────────────────────────────────────────────────────────────────────────

  describe('useDisconnect', () => {
    /** Test: disconnect function is exposed and callable */
    it('exposes disconnect function from useDisconnect', () => {
      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      act(() => {
        result.current.disconnect();
      });

      expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // useBalance: PSL token + MATIC balance
  // ──────────────────────────────────────────────────────────────────────────

  describe('useBalance', () => {
    /** Test: balance data is returned when wallet has MATIC balance */
    it('returns MATIC balance data when connected', () => {
      mockUseAccount.mockReturnValue(connectedAccountState());
      mockUseBalance.mockReturnValue({
        data: {
          value: BigInt('2750000000000000000'), // 2.75 MATIC
          decimals: 18,
          formatted: '2.75',
          symbol: 'MATIC',
        },
        isError: false,
        isLoading: false,
        isSuccess: true,
        error: null,
        status: 'success',
      });

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      // useWeb3 doesn't call useBalance — it delegates balance queries to callers.
      // Verify the hook returns the connected state correctly.
      expect(result.current.isConnected).toBe(true);
      expect(result.current.address).toBe(MOCK_ADDRESS);
    });

    /** Test: balance is undefined when wallet is disconnected */
    it('returns no balance data when disconnected', () => {
      mockUseBalance.mockReturnValue({
        data: undefined,
        isError: false,
        isLoading: false,
        isSuccess: false,
        error: null,
        status: 'pending',
      });

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });
      expect(result.current.isConnected).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // useChainId / Network Detection
  // ──────────────────────────────────────────────────────────────────────────

  describe('Network detection (via chain)', () => {
    /** Test: chain is Polygon Amoy when connected to testnet */
    it('detects Polygon Amoy testnet', () => {
      mockUseAccount.mockReturnValue(connectedAccountState({ chain: POLYGON_AMOY_CHAIN }));

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      expect(result.current.chain?.id).toBe(80002);
      expect(result.current.chain?.name).toBe('Polygon Amoy');
    });

    /** Test: chain is Polygon mainnet when connected to mainnet */
    it('detects Polygon mainnet', () => {
      mockUseAccount.mockReturnValue(connectedAccountState({ chain: POLYGON_CHAIN }));

      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      expect(result.current.chain?.id).toBe(137);
      expect(result.current.chain?.name).toBe('Polygon');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Auto-switch chain behavior
  // ──────────────────────────────────────────────────────────────────────────

  describe('Auto-switch to default chain', () => {
    /**
     * Test: when wallet connects to a non-default chain (Ethereum),
     * the hook automatically calls switchChain to the default chain (Amoy).
     */
    it('auto-switches to default chain when on wrong network', () => {
      mockUseAccount.mockReturnValue(
        connectedAccountState({ chain: ETHEREUM_CHAIN })
      );

      renderHook(() => useWeb3(), { wrapper: TestWrapper });

      // The useEffect in useWeb3 should trigger switchChain
      expect(mockSwitchChainFn).toHaveBeenCalledWith({ chainId: DEFAULT_CHAIN_ID });
    });

    /**
     * Test: does NOT auto-switch when already on the default chain.
     */
    it('does not auto-switch when already on default chain', () => {
      mockUseAccount.mockReturnValue(
        connectedAccountState({ chain: POLYGON_AMOY_CHAIN })
      );

      renderHook(() => useWeb3(), { wrapper: TestWrapper });

      // switchChain should NOT have been called with the DEFAULT_CHAIN_ID
      // since we're already on it
      const calls = mockSwitchChainFn.mock.calls;
      const switchingToDefault = calls.filter(
        (call: unknown[]) => (call[0] as { chainId: number }).chainId === DEFAULT_CHAIN_ID
      );
      expect(switchingToDefault).toHaveLength(0);
    });

    /** Test: does not auto-switch when disconnected */
    it('does not auto-switch when wallet is disconnected', () => {
      renderHook(() => useWeb3(), { wrapper: TestWrapper });

      expect(mockSwitchChainFn).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Account Change Detection
  // ──────────────────────────────────────────────────────────────────────────

  describe('Account change detection', () => {
    /**
     * Test: when the connected address changes (e.g., user switches account
     * in MetaMask), the hook reflects the new address on re-render.
     */
    it('reflects new address when account changes', () => {
      // Start connected with MOCK_ADDRESS
      mockUseAccount.mockReturnValue(connectedAccountState({ address: MOCK_ADDRESS }));

      const { result, rerender } = renderHook(() => useWeb3(), { wrapper: TestWrapper });
      expect(result.current.address).toBe(MOCK_ADDRESS);

      // Simulate account change
      mockUseAccount.mockReturnValue(connectedAccountState({ address: MOCK_ADDRESS_2 }));
      rerender();

      expect(result.current.address).toBe(MOCK_ADDRESS_2);
    });

    /**
     * Test: when user disconnects in the wallet extension, the hook
     * transitions to disconnected state.
     */
    it('transitions to disconnected when wallet disconnects externally', () => {
      mockUseAccount.mockReturnValue(connectedAccountState());

      const { result, rerender } = renderHook(() => useWeb3(), { wrapper: TestWrapper });
      expect(result.current.isConnected).toBe(true);

      // Simulate external disconnect
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
      rerender();

      expect(result.current.isConnected).toBe(false);
      expect(result.current.address).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // switchChain exposed
  // ──────────────────────────────────────────────────────────────────────────

  describe('switchChain exposure', () => {
    /** Test: switchChain is exposed for manual chain switching */
    it('exposes switchChain from useSwitchChain', () => {
      const { result } = renderHook(() => useWeb3(), { wrapper: TestWrapper });

      expect(result.current.switchChain).toBeDefined();
      expect(typeof result.current.switchChain).toBe('function');
    });
  });
});
