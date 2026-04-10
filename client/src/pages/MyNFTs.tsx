import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Sparkles, Wallet, Tag, RefreshCw, TrendingUp,
  ShoppingBag, Clock, ChevronRight, Coins, Trophy, Lock
} from "lucide-react";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  Rare: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Epic: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Legendary: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
};

export default function MyNFTs() {
  const { user, loading } = useAuth();
  const [listDialog, setListDialog] = useState<{ open: boolean; card?: any }>({ open: false });
  const [listPrice, setListPrice] = useState(100);

  const utils = trpc.useUtils();
  const { data: myCards, isLoading: cardsLoading } = trpc.nftPlatform.myCards.useQuery();
  const { data: balanceData } = trpc.nftPlatform.myBalance.useQuery();
  const { data: creditHistory } = trpc.nftPlatform.myCreditHistory.useQuery();

  const listMutation = trpc.nftPlatform.listForSale.useMutation({
    onSuccess: () => {
      toast.success("Card listed on the marketplace!");
      utils.nftPlatform.myCards.invalidate();
      setListDialog({ open: false });
    },
    onError: (e) => toast.error(e.message),
  });

  const cancelMutation = trpc.nftPlatform.cancelListing.useMutation({
    onSuccess: () => {
      toast.success("Listing cancelled.");
      utils.nftPlatform.myCards.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Sign in to view your NFT collection and PSL credits.</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
        </div>
      </div>
    );
  }

  const balance = balanceData?.balance ?? 0;
  const ownedCards = myCards ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                My NFT Collection
              </h1>
              <p className="text-muted-foreground mt-1">Your Performer NFT cards and PSL credits</p>
            </div>
            <Link href="/marketplace">
              <Button className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Browse Marketplace
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{balance.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">PSL Credits</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ownedCards.length}</p>
                  <p className="text-sm text-muted-foreground">NFT Cards Owned</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Tag className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {ownedCards.filter((c: any) => c.isLocked).length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Active Tournament</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="cards">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cards" className="gap-2">
                <Sparkles className="h-4 w-4" /> My Cards ({ownedCards.length})
              </TabsTrigger>
              <TabsTrigger value="credits" className="gap-2">
                <Coins className="h-4 w-4" /> Credit History
              </TabsTrigger>
            </TabsList>

            {/* MY CARDS TAB */}
            <TabsContent value="cards" className="mt-6">
              {cardsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : ownedCards.length === 0 ? (
                <Card>
                  <CardContent className="py-20 text-center">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                    <p className="text-xl text-muted-foreground mb-2">No NFT cards yet</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Purchase cards on the marketplace or earn them through tournaments
                    </p>
                    <Link href="/marketplace">
                      <Button className="gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Browse Marketplace
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ownedCards.map((card: any) => (
                    <Card key={card.id} className="overflow-hidden group">
                      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                        {(card.cardImageUrl || card.performerImageUrl) ? (
                          <img
                            src={card.cardImageUrl ?? card.performerImageUrl}
                            alt={card.performerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        {/* Hover overlay */}
                        {!card.isLocked && (
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => {
                                setListPrice(100);
                                setListDialog({ open: true, card });
                              }}
                            >
                              <Tag className="h-3 w-3" /> List for Sale
                            </Button>
                          </div>
                        )}
                        {/* Badges */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`text-xs ${RARITY_COLORS[card.rarity]}`}>{card.rarity}</Badge>
                        </div>
                        {card.isLocked && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-orange-500/90 text-xs gap-1">
                              <Lock className="h-2.5 w-2.5" /> Locked
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2 space-y-1">
                        <p className="text-xs font-semibold truncate">{card.performerName}</p>
                        <p className="text-xs text-muted-foreground">#{card.serialNumber}</p>
                        <Link href={`/performers/${card.performerId}`}>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                            View Profile <ChevronRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* CREDIT HISTORY TAB */}
            <TabsContent value="credits" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    PSL Credit History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!creditHistory || creditHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                      <p className="text-muted-foreground">No credit transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {creditHistory.map((tx: any) => (
                        <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              tx.amount > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            }`}>
                              {tx.amount > 0 ? "+" : ""}
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">{tx.type.replace(/_/g, " ")}</p>
                              {tx.description && <p className="text-xs text-muted-foreground">{tx.description}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                              {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} PSL
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* LIST FOR SALE DIALOG */}
      <Dialog open={listDialog.open} onOpenChange={(o) => setListDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Card for Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {listDialog.card && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  {(listDialog.card.cardImageUrl || listDialog.card.performerImageUrl) && (
                    <img src={listDialog.card.cardImageUrl ?? listDialog.card.performerImageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{listDialog.card.performerName}</p>
                  <p className="text-sm text-muted-foreground">#{listDialog.card.serialNumber} · {listDialog.card.rarity}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Listing Price (PSL Credits)</Label>
              <Input
                type="number"
                min={1}
                value={listPrice}
                onChange={(e) => setListPrice(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <p className="text-xs text-muted-foreground">
                Platform fee: 5% — You receive {Math.floor(listPrice * 0.95).toLocaleString()} PSL credits after sale.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setListDialog({ open: false })}>Cancel</Button>
            <Button
              disabled={listMutation.isPending}
              onClick={() => {
                if (!listDialog.card) return;
                listMutation.mutate({ cardId: listDialog.card.id, priceCredits: listPrice });
              }}
            >
              {listMutation.isPending ? (
                <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Listing...</>
              ) : (
                <><Tag className="h-4 w-4 mr-2" />List for {listPrice.toLocaleString()} PSL</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
