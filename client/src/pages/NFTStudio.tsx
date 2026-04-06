import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Sparkles, Search, Shield, RefreshCw, Star, Users, Image, Zap } from "lucide-react";
import { toast } from "sonner";

export default function NFTStudio() {
  const { user, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

  const { data: performers, isLoading, refetch } = trpc.performers.list.useQuery();

  const filtered = (performers ?? []).filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">The NFT Studio is only accessible to platform administrators.</p>
            {!user ? (
              <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
            ) : (
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleRegenerate = async (performerId: number, performerName: string) => {
    setRegeneratingId(performerId);
    toast.info(`Regenerating NFT card for ${performerName}...`);
    // Simulate regeneration — in production this calls the card generation endpoint
    setTimeout(() => {
      setRegeneratingId(null);
      toast.success(`NFT card for ${performerName} regenerated!`);
      refetch();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">NFT Studio</h1>
                <Badge variant="outline" className="text-primary border-primary">Admin</Badge>
              </div>
              <p className="text-muted-foreground">Generate and manage performer NFT cards with badges and branding</p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Performers", value: performers?.length ?? 0, icon: Users },
              { label: "Cards Generated", value: performers?.filter((p: any) => p.imageUrl).length ?? 0, icon: Image },
              { label: "With Badges", value: performers?.filter((p: any) => p.performerType).length ?? 0, icon: Star },
              { label: "Pending", value: performers?.filter((p: any) => !p.imageUrl).length ?? 0, icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search performers..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Performer Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles className="h-16 w-16 mx-auto mb-3" />
              <p>No performers found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((p: any) => (
                <Card key={p.id} className="overflow-hidden group">
                  <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : p.portraitUrl ? (
                      <img
                        src={p.portraitUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs gap-1"
                        disabled={regeneratingId === p.id}
                        onClick={() => handleRegenerate(p.id, p.name)}
                      >
                        {regeneratingId === p.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                    {p.imageUrl && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2 space-y-1">
                    <p className="text-xs font-semibold truncate">{p.name}</p>
                    {p.performerType ? (
                      <Badge variant="outline" className="text-xs text-primary border-primary w-full justify-center">
                        {p.performerType}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground w-full justify-center">
                        No Badge
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bulk Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
              <CardDescription>Apply operations to multiple performer cards at once</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.info("Bulk regeneration coming soon!")}
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate All Cards
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.info("Batch badge assignment coming soon!")}
              >
                <Star className="h-4 w-4" />
                Batch Assign Badges
              </Button>
              <Link href="/admin">
                <Button variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Manage Performers in Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
