import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import PackOpeningAnimation from "@/components/PackOpeningAnimation";
import { ShoppingBag, Coins, Sparkles, ChevronLeft } from "lucide-react";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  Rare: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Epic: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Legendary: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
};

export default function PackShop() {
  const { user } = useAuth();
  const [showAnimation, setShowAnimation] = useState(false);
  const [purchasedCards, setPurchasedCards] = useState<any[]>([]);
  const [purchasedPackName, setPurchasedPackName] = useState("");

  const utils = trpc.useUtils();
  const { data: packs, isLoading: packsLoading } = trpc.packs.getAvailable.useQuery();
  const { data: balanceData } = trpc.nftPlatform.myBalance.useQuery();

  const purchaseMutation = trpc.packs.purchase.useMutation({
    onSuccess: (result) => {
      // Fetch the purchased cards to show in animation
      const cardPromises = result.cardIds.map((id) => utils.nftPlatform.getCard.fetch({ cardId: id }));
      Promise.all(cardPromises).then((cards) => {
        setPurchasedCards(cards);
        setPurchasedPackName(result.packName);
        setShowAnimation(true);
        utils.nftPlatform.myCards.invalidate();
        utils.nftPlatform.myBalance.invalidate();
      });
    },
    onError: (e) => {
      alert(`Purchase failed: ${e.message}`);
    },
  });

  const balance = balanceData?.balance ?? 0;

  const handlePurchase = (packTypeId: number) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    purchaseMutation.mutate({ packTypeId });
  };

  const handleCloseAnimation = () => {
    setShowAnimation(false);
    setPurchasedCards([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Pack Opening Animation */}
      {showAnimation && purchasedCards.length > 0 && (
        <PackOpeningAnimation
          cards={purchasedCards}
          packName={purchasedPackName}
          onClose={handleCloseAnimation}
        />
      )}

      <div className="container py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/marketplace">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Marketplace
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                  Card Packs
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">
                Purchase randomized packs of Performer NFT cards
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">{balance.toLocaleString()} PSL</span>
                </div>
              )}
            </div>
          </div>

          {/* Pack Cards */}
          {packsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs?.map((pack: any) => (
                <Card key={pack.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-bold">{pack.name}</h2>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 h-10">
                      {pack.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rare Cards</span>
                        <Badge className={RARITY_COLORS.Rare}>
                          {pack.rareCount}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Uncommon Cards</span>
                        <Badge className={RARITY_COLORS.Epic}>
                          {pack.uncommonCount}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Common Cards</span>
                        <Badge className={RARITY_COLORS.Common}>
                          {pack.commonCount}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground">Total Cards</span>
                        <span className="font-bold">{pack.cardCount}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground">Price</span>
                        <div className="flex items-center gap-2 font-bold text-primary">
                          <Coins className="h-5 w-5" />
                          ${(pack.priceUsdCents / 100).toFixed(2)} USD
                          <span className="text-xs text-muted-foreground">
                            ({pack.priceUsdCents * 10} PSL)
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2"
                      onClick={() => handlePurchase(pack.id)}
                      disabled={purchaseMutation.isPending || !user}
                    >
                      {purchaseMutation.isPending ? (
                        <>Purchasing...</>
                      ) : !user ? (
                        <>Sign In to Purchase</>
                      ) : (
                        <><ShoppingBag className="h-4 w-4" /> Buy Pack</>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Preview Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Treasury Preview
            </h2>
            <p className="text-muted-foreground mb-4">
              These are sample cards from the treasury that could appear in your pack
            </p>
            
            <PackPreviewSection />
          </div>
        </div>
      </div>
    </div>
  );
}

function PackPreviewSection() {
  const { data: preview, isLoading } = trpc.packs.getTreasuryPreview.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {preview?.rare && preview.rare.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-400 mb-2">Rare (1 per pack)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {preview.rare.map((card: any) => (
              <PackPreviewCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
      
      {preview?.common && preview.common.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Common (5 per pack)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {preview.common.map((card: any) => (
              <PackPreviewCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PackPreviewCard({ card }: { card: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/4] bg-muted relative">
        {card.cardImageUrl ? (
          <img
            src={card.cardImageUrl}
            alt={card.performerName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={`text-xs ${RARITY_COLORS[card.rarity]}`}>
            {card.rarity}
          </Badge>
        </div>
      </div>
      <CardContent className="p-2">
        <p className="text-xs font-semibold truncate">{card.performerName}</p>
      </CardContent>
    </Card>
  );
}