import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Trophy, User, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { NotificationSettings } from "@/components/NotificationSettings";
import { Link, useLocation } from "wouter";
import { LoginButton } from "@/components/LoginDialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: nftCards, isLoading: nftsLoading } = trpc.nftPlatform.myCards.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: tournaments } = trpc.tournaments.list.useQuery();
  const { data: entries } = trpc.tournaments.getAllUserEntries.useQuery(undefined, { enabled: !!user });
  const { data: onboardingStatus } = trpc.onboarding.status.useQuery(undefined, { enabled: !!user });
  const claimStarterPack = trpc.onboarding.claimStarterPack.useMutation({
    onSuccess: () => {
      toast.success("Starter pack claimed! You got 3 NFT cards and 100 credits.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to claim starter pack");
    },
  });

  if (loading) {
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
            <CardDescription>Please sign in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginButton className="w-full">Sign In</LoginButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeTournaments = tournaments?.filter((t) => {
    const now = new Date();
    return now >= new Date(t.startDate) && now <= new Date(t.endDate);
  });

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name || "User"}!</p>
            </div>
            {user.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline">Admin Panel</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">

        {/* Onboarding: Starter Pack Banner */}
        {user && onboardingStatus && !onboardingStatus.starterPackClaimed && (
          <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Claim Your Free Starter Pack!</p>
                  <p className="text-sm text-muted-foreground">Get 3 free performer NFT cards and 100 PSL credits to enter your first tournament.</p>
                </div>
                <Button
                  onClick={() => claimStarterPack.mutate()}
                  disabled={claimStarterPack.isPending}
                  className="gap-2 flex-shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  {claimStarterPack.isPending ? "Claiming..." : "Claim Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Notification Settings */}
        <NotificationSettings />

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Porn Star NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{nftCards?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Performer NFT cards</p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <Link href="/my-nfts">
                <Button variant="link" size="sm" className="p-0 h-auto mt-3">
                  View Collection →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{activeTournaments?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ongoing competitions</p>
                </div>
                <Trophy className="h-8 w-8 text-accent" />
              </div>
              <Link href="/tournaments">
                <Button variant="link" size="sm" className="p-0 h-auto mt-3">
                  Browse Tournaments →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {user.walletAddress ? (
                    <>
                      <p className="text-sm font-mono text-accent">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        Connected
                      </Badge>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                      <Link href="/my-nfts">
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                          Connect Wallet
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFT Collection Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your NFT Collection</CardTitle>
              <CardDescription>Porn Star NFTs you own on Polygon</CardDescription>
            </div>
              <Link href="/my-nfts">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {nftsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading collection...</p>
              </div>
            )            : nftCards && nftCards.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {nftCards.slice(0, 6).map((nft: any) => (
                  <Link key={nft.id} href={`/performers/${nft.performerId}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-[3/4] relative bg-muted rounded-lg overflow-hidden">
                        {nft.cardImageUrl ? (
                          <img
                            src={nft.cardImageUrl}
                            alt={nft.performer?.name || "Performer"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary/90 backdrop-blur-sm text-xs">
                            {nft.rarity || `#${nft.id}`}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm font-medium mt-2 truncate">{nft.performer?.name || `Card #${nft.id}`}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No NFTs in your collection</p>
                <Link href="/my-nfts">
                  <Button variant="outline" size="sm">
                    Connect Wallet
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Tournaments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Tournaments</CardTitle>
                <CardDescription>Ongoing competitions you can join</CardDescription>
              </div>
              <Link href="/tournaments">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeTournaments && activeTournaments.length > 0 ? (
              <div className="space-y-4">
                {activeTournaments.slice(0, 3).map((tournament) => (
                  <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <Trophy className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">
                            {tournament.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ends {new Date(tournament.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No active tournaments</p>
                <Link href="/tournaments">
                  <Button variant="outline" size="sm">
                    Browse All Tournaments
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tournament Entries */}
        {entries && entries.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Entries</CardTitle>
                  <CardDescription>Tournaments you've entered</CardDescription>
                </div>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="gap-2">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.slice(0, 5).map((entry: any) => {
                  const tournament = tournaments?.find(t => t.id === entry.tournamentId);
                  return (
                    <Link key={entry.id} href={`/tournaments/${entry.tournamentId}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{tournament?.name || `Tournament #${entry.tournamentId}`}</p>
                            <p className="text-xs text-muted-foreground">{tournament?.status || "Active"}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-bold">
                          {entry.totalScore ?? 0} pts
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
