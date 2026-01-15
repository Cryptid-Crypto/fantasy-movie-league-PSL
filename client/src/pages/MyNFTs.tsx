import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useWeb3 } from "@/hooks/useWeb3";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, RefreshCw, User, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ethers } from "ethers";
import { readUserNFTs } from "@/lib/nftReader";
import { getLoginUrl } from "@/const";

export default function MyNFTs() {
  const { user, loading: authLoading } = useAuth();
  const { address, isConnected, connectWallet, isPending: web3Pending } = useWeb3();
  const [, setLocation] = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);

  const utils = trpc.useUtils();
  const { data: nfts, isLoading: nftsLoading } = trpc.nfts.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: performers } = trpc.performers.list.useQuery();

  const syncMutation = trpc.nfts.sync.useMutation({
    onSuccess: () => {
      utils.nfts.list.invalidate();
      toast.success("NFTs synced successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateWalletMutation = trpc.auth.updateWallet.useMutation({
    onSuccess: () => {
      toast.success("Wallet connected");
    },
  });

  // Auto-connect wallet when address changes
  useEffect(() => {
    if (user && address && user.walletAddress !== address) {
      updateWalletMutation.mutate({ walletAddress: address });
    }
  }, [user, address]);

  const handleSyncNFTs = async () => {
    if (!address || !performers) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSyncing(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const allNFTs: any[] = [];

      // Read NFTs from each performer's contract
      for (const performer of performers) {
        if (performer.nftContractAddress) {
          try {
            const nfts = await readUserNFTs(address, performer.nftContractAddress, provider);
            allNFTs.push(
              ...nfts.map((nft) => ({
                performerId: performer.id,
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
              }))
            );
          } catch (error) {
            console.error(`Failed to read NFTs for ${performer.name}:`, error);
          }
        }
      }

      await syncMutation.mutateAsync({ nfts: allNFTs });
    } catch (error: any) {
      toast.error(error.message || "Failed to sync NFTs");
    } finally {
      setIsSyncing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your NFT collection</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">My NFT Collection</h1>
          <p className="text-muted-foreground">Performer NFTs owned on Polygon</p>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Wallet Connection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected && address ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
                    <p className="font-mono text-accent">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                  <Badge className="bg-accent/10 text-accent border-accent/20">Connected</Badge>
                </div>
                <Button
                  onClick={handleSyncNFTs}
                  disabled={isSyncing || syncMutation.isPending}
                  className="w-full gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing NFTs..." : "Sync NFTs from Blockchain"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Connect your Polygon wallet to view your NFTs
                </p>
                <Button onClick={connectWallet} disabled={web3Pending} className="gap-2">
                  <Wallet className="h-4 w-4" />
                  {web3Pending ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NFT Collection */}
        {nftsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your collection...</p>
          </div>
        ) : nfts && nfts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Collection</h2>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {nfts.length} NFT{nfts.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {nfts.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:glow transition-all">
                  <div className="aspect-[3/4] relative bg-muted">
                    {nft.performerImage ? (
                      <img
                        src={nft.performerImage}
                        alt={nft.performerName || "Performer"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary/90 backdrop-blur-sm">
                        #{nft.tokenId}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground truncate mb-1">
                      {nft.performerName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                    </p>
                    <Link href={`/performers/${nft.performerId}`}>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                        View Profile →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">No NFTs Found</p>
              <p className="text-sm text-muted-foreground mb-6">
                {isConnected
                  ? "Connect your wallet and sync to load your NFTs"
                  : "You don't have any Performer NFTs yet"}
              </p>
              {isConnected && (
                <Button onClick={handleSyncNFTs} disabled={isSyncing} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync NFTs
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
