import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Search, Filter, Star, TrendingUp, Wallet, Sparkles, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-slate-500/40 text-slate-400",
  Rare: "border-blue-500/40 text-blue-400",
  Epic: "border-purple-500/40 text-purple-400",
  Legendary: "border-yellow-500/40 text-yellow-400",
};

export default function Marketplace() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");

  const { data: performers, isLoading } = trpc.performers.list.useQuery();

  const filtered = (performers ?? []).filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || p.performerType === filterType;
    return matchesSearch && matchesType;
  });

  const performerTypes = ["all", ...Array.from(new Set((performers ?? []).map((p: any) => p.performerType).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-primary" />
                NFT Marketplace
              </h1>
              <p className="text-muted-foreground mt-1">Buy, sell, and trade Performer NFT cards</p>
            </div>
            {user && (
              <Link href="/my-nfts">
                <Button variant="outline" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  My Collection
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Listings", value: performers?.length ?? 0, icon: ShoppingBag },
              { label: "Performers", value: performers?.length ?? 0, icon: Star },
              { label: "Floor Price", value: "0.1 MATIC", icon: TrendingUp },
              { label: "Volume (24h)", value: "—", icon: ArrowUpDown },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-lg font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search performers..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {performerTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "all" ? "All Types" : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="points">Most Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-xl font-semibold">No listings found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((p: any) => {
                const price = (0.1 + Math.random() * 2).toFixed(2);
                const rarity = p.performerType === "Legend" ? "Legendary" : p.performerType === "Hall of Fame" ? "Epic" : p.performerType === "Rising Star" ? "Rare" : "Common";
                return (
                  <Card key={p.id} className="overflow-hidden group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {p.imageUrl || p.portraitUrl ? (
                        <img
                          src={p.imageUrl ?? p.portraitUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className={`text-xs ${RARITY_COLORS[rarity] ?? ""} bg-background/80 backdrop-blur-sm`}>
                          {rarity}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      {p.performerType && (
                        <p className="text-xs text-muted-foreground">{p.performerType}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{price} MATIC</span>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!user) {
                              window.location.href = getLoginUrl();
                              return;
                            }
                            toast.info("Marketplace trading coming soon!");
                          }}
                        >
                          Buy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
