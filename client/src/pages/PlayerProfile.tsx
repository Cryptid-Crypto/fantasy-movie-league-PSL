import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  Trophy, Wallet, Star, TrendingUp, Award, Calendar,
  Copy, ExternalLink, Shield, Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function PlayerProfile() {
  const { user, loading } = useAuth();
  const { data: nfts } = trpc.nfts.list.useQuery(undefined, { enabled: !!user });
  const { data: tournaments } = trpc.tournaments.list.useQuery();

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
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Sign In to View Your Profile</h2>
            <p className="text-muted-foreground">Create an account or sign in to access your player profile, NFT collection, and tournament history.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup">
                <Button variant="outline">Sign Up</Button>
              </Link>
              <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nftCount = nfts?.length ?? 0;
  const initials = user.name?.slice(0, 2).toUpperCase() ?? "??";

  const copyWallet = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast.success("Wallet address copied!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Profile Header */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
            <CardContent className="pt-0 pb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-10">
                <Avatar className="w-20 h-20 border-4 border-background text-2xl">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.name ?? "Player"}</h1>
                    {user.role === "admin" && (
                      <Badge variant="default" className="w-fit">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  {user.email && <p className="text-muted-foreground text-sm">{user.email}</p>}
                </div>
                <div className="flex gap-2">
                  <Link href="/my-nfts">
                    <Button variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      My NFTs
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "NFTs Owned", value: nftCount, icon: Sparkles, color: "text-primary" },
              { label: "Tournaments", value: "—", icon: Trophy, color: "text-yellow-500" },
              { label: "Total Points", value: "—", icon: TrendingUp, color: "text-green-500" },
              { label: "Rank", value: "—", icon: Star, color: "text-blue-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-4 text-center">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="nfts">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="nfts" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">NFT Collection</span>
                <span className="sm:hidden">NFTs</span>
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Tournaments</span>
                <span className="sm:hidden">Events</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="wallet" className="gap-2">
                <Wallet className="h-4 w-4" />
                Wallet
              </TabsTrigger>
            </TabsList>

            {/* NFT Collection Tab */}
            <TabsContent value="nfts" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My NFT Collection</CardTitle>
                  <CardDescription>Performer NFTs in your wallet — {nftCount} card{nftCount !== 1 ? "s" : ""}</CardDescription>
                </CardHeader>
                <CardContent>
                  {nftCount === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">You don't own any NFTs yet.</p>
                      <Link href="/marketplace">
                        <Button className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          Browse Marketplace
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {nfts?.map((nft: any) => (
                        <Link key={nft.id} href={`/performers/${nft.performerId}`}>
                          <Card className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="aspect-[3/4] bg-muted relative">
                              {nft.performer?.imageUrl && (
                                <img
                                  src={nft.performer.imageUrl}
                                  alt={nft.performer.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <CardContent className="p-2">
                              <p className="text-xs font-medium truncate">{nft.performer?.name}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tournaments Tab */}
            <TabsContent value="tournaments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tournament History</CardTitle>
                  <CardDescription>Your competition record and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No tournament history yet.</p>
                    <Link href="/tournaments">
                      <Button variant="outline" className="gap-2">
                        <Trophy className="h-4 w-4" />
                        Browse Tournaments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Badges and milestones you've earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { name: "First NFT", desc: "Acquired your first performer NFT", earned: nftCount > 0 },
                      { name: "Collector", desc: "Own 5 or more NFTs", earned: nftCount >= 5 },
                      { name: "High Roller", desc: "Own 20 or more NFTs", earned: nftCount >= 20 },
                      { name: "Tournament Rookie", desc: "Enter your first tournament", earned: false },
                      { name: "Podium Finish", desc: "Finish in the top 3", earned: false },
                      { name: "Champion", desc: "Win a tournament", earned: false },
                    ].map(({ name, desc, earned }) => (
                      <div key={name} className={`p-4 rounded-lg border text-center space-y-2 ${earned ? "border-primary/40 bg-primary/5" : "border-border opacity-40"}`}>
                        <Award className={`h-8 w-8 mx-auto ${earned ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="font-semibold text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                        {earned && <Badge variant="outline" className="text-xs text-primary border-primary">Earned</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet & Transactions</CardTitle>
                  <CardDescription>Your connected Polygon wallet and transaction history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {user.walletAddress ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
                          <p className="font-mono text-sm truncate">{user.walletAddress}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={copyWallet} title="Copy address">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View on Polygonscan"
                            onClick={() => window.open(`https://polygonscan.com/address/${user.walletAddress}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No transactions yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">No wallet connected yet.</p>
                      <p className="text-sm text-muted-foreground">Connect a Polygon wallet to participate in paid tournaments and receive prizes.</p>
                      <Button className="gap-2">
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
