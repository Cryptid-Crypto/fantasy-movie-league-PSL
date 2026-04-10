import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  ShoppingBag, Search, Filter, RefreshCw, Sparkles,
  Coins, Tag, TrendingUp, ChevronRight
} from "lucide-react";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  Rare: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Epic: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Legendary: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
};

export default function Marketplace() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [buyDialog, setBuyDialog] = useState<{ open: boolean; listing?: any }>({ open: false });

  const utils = trpc.useUtils();
  const { data: listings, isLoading } = trpc.nftPlatform.getListings.useQuery({});
  const { data: balanceData } = trpc.nftPlatform.myBalance.useQuery();

  const buyMutation = trpc.nftPlatform.buy.useMutation({
    onSuccess: () => {
      toast.success("NFT card purchased successfully!");
      utils.nftPlatform.getListings.invalidate();
      utils.nftPlatform.myCards.invalidate();
      utils.nftPlatform.myBalance.invalidate();
      setBuyDialog({ open: false });
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (listings ?? []).filter((l: any) => {
    const matchSearch = !search || l.performerName?.toLowerCase().includes(search.toLowerCase());
    const matchRarity = rarityFilter === "all" || l.rarity === rarityFilter;
    return matchSearch && matchRarity;
  });

  const balance = balanceData?.balance ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-primary" />
                NFT Marketplace
              </h1>
              <p className="text-muted-foreground mt-1">Buy and sell Performer NFT cards with PSL credits</p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">{balance.toLocaleString()} PSL</span>
                </div>
              )}
              <Link href="/my-nfts">
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  My Collection
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-primary">{listings?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Active Listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {(listings ?? []).filter((l: any) => l.rarity === "Legendary").length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Legendary Cards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {(listings ?? []).filter((l: any) => l.rarity === "Epic").length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Epic Cards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {(listings ?? []).filter((l: any) => l.rarity === "Rare").length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Rare Cards</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by performer name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                <p className="text-xl text-muted-foreground mb-2">No listings found</p>
                <p className="text-sm text-muted-foreground">
                  {search || rarityFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Be the first to list a card — sell from your collection in My NFTs"}
                </p>
                {user && (
                  <Link href="/my-nfts">
                    <Button className="mt-4 gap-2">
                      <Tag className="h-4 w-4" />
                      List a Card
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((listing: any) => (
                <Card key={listing.listingId} className="overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                    {(listing.cardImageUrl || listing.performerImageUrl) ? (
                      <img
                        src={listing.cardImageUrl ?? listing.performerImageUrl}
                        alt={listing.performerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    {/* Buy overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {user ? (
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs gap-1"
                          disabled={listing.sellerId === user?.id}
                          onClick={() => setBuyDialog({ open: true, listing })}
                        >
                          {listing.sellerId === user?.id ? "Your Listing" : (
                            <><Coins className="h-3 w-3" /> Buy Now</>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => (window.location.href = getLoginUrl())}
                        >
                          Sign In to Buy
                        </Button>
                      )}
                      <Link href={`/performers/${listing.performerId}`}>
                        <Button size="sm" variant="secondary" className="w-full h-8 text-xs gap-1">
                          View Profile <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                    {/* Rarity badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className={`text-xs ${RARITY_COLORS[listing.rarity]}`}>{listing.rarity}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-2 space-y-1">
                    <p className="text-xs font-semibold truncate">{listing.performerName}</p>
                    <p className="text-xs text-muted-foreground">#{listing.serialNumber}</p>
                    <div className="flex items-center gap-1 text-primary font-bold text-sm">
                      <Coins className="h-3 w-3" />
                      {listing.priceCredits.toLocaleString()} PSL
                    </div>
                    <p className="text-xs text-muted-foreground truncate">by {listing.sellerName}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BUY CONFIRMATION DIALOG */}
      <Dialog open={buyDialog.open} onOpenChange={(o) => setBuyDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          {buyDialog.listing && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  {(buyDialog.listing.cardImageUrl || buyDialog.listing.performerImageUrl) && (
                    <img src={buyDialog.listing.cardImageUrl ?? buyDialog.listing.performerImageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{buyDialog.listing.performerName}</p>
                  <p className="text-sm text-muted-foreground">#{buyDialog.listing.serialNumber} · {buyDialog.listing.rarity}</p>
                  <p className="text-sm text-muted-foreground">Sold by {buyDialog.listing.sellerName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-muted-foreground">Price</span>
                <div className="flex items-center gap-2 font-bold text-primary text-lg">
                  <Coins className="h-5 w-5" />
                  {buyDialog.listing.priceCredits.toLocaleString()} PSL
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-muted-foreground">Your Balance</span>
                <div className={`flex items-center gap-2 font-bold text-lg ${balance >= buyDialog.listing.priceCredits ? "text-green-400" : "text-red-400"}`}>
                  <Coins className="h-5 w-5" />
                  {balance.toLocaleString()} PSL
                </div>
              </div>
              {balance < buyDialog.listing.priceCredits && (
                <p className="text-sm text-red-400 text-center">
                  Insufficient PSL credits. You need {(buyDialog.listing.priceCredits - balance).toLocaleString()} more PSL.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialog({ open: false })}>Cancel</Button>
            <Button
              disabled={!buyDialog.listing || balance < (buyDialog.listing?.priceCredits ?? 0) || buyMutation.isPending}
              onClick={() => {
                if (!buyDialog.listing) return;
                buyMutation.mutate({ listingId: buyDialog.listing.listingId });
              }}
            >
              {buyMutation.isPending ? (
                <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Purchasing...</>
              ) : (
                <><Coins className="h-4 w-4 mr-2" />Confirm Purchase</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
