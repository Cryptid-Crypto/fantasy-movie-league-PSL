import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { DEFAULT_CHAIN_ID } from '@/lib/web3Config';
import { useEffect } from 'react';

export function useWeb3() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Auto-switch to Polygon if connected to wrong network
  useEffect(() => {
    if (isConnected && chain && chain.id !== DEFAULT_CHAIN_ID) {
      switchChain?.({ chainId: DEFAULT_CHAIN_ID });
    }
  }, [isConnected, chain, switchChain]);

  const connectWallet = async () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector, chainId: DEFAULT_CHAIN_ID });
    }
  };

  return {
    address,
    isConnected,
    chain,
    connectWallet,
    disconnect,
    isPending,
    switchChain,
  };
}
