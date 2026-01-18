import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { formatAddress, formatTokenAmount } from '@/lib/web3';
import { useState } from 'react';
import { toast } from 'sonner';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchToPolygon = () => {
    // Switch to Polygon Amoy testnet for development
    switchChain({ chainId: polygonAmoy.id });
  };

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Connect Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const isWrongNetwork = chain?.id !== polygon.id && chain?.id !== polygonAmoy.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={isWrongNetwork ? 'border-red-500' : ''}>
          <Wallet className="mr-2 h-4 w-4" />
          {isWrongNetwork ? 'Wrong Network' : formatAddress(address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Address:</span>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 hover:text-primary"
            >
              {formatAddress(address!)}
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          
          {balance && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">
                {formatTokenAmount(balance.value)} {balance.symbol}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">{chain?.name || 'Unknown'}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {isWrongNetwork && (
          <DropdownMenuItem onClick={handleSwitchToPolygon}>
            Switch to Polygon Amoy
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
