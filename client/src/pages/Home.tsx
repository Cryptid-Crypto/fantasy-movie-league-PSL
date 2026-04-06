import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Wallet, Zap, Film, Crown, ShoppingBag, BarChart2, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Compete with{" "}
              <span className="text-primary">
                Porn Star NFTs
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The first Web3 fantasy tournament platform where your Porn Star NFTs compete based on
              real scene performance data on Polygon Network.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            {user ? (
              <>
                <Link href="/tournaments">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Trophy className="h-5 w-5" />
                    Browse Tournaments
                  </Button>
                </Link>
                <Link href="/my-nfts">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    <Wallet className="h-5 w-5" />
                    My Collection
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="gap-2 w-full sm:w-auto"
                >
                  Get Started
                </Button>
                <Link href="/performers">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Explore Performers
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            A fantasy sports experience for adult entertainment
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-elevated hover-lift">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Own Performer NFTs</h3>
              <p className="text-muted-foreground">
                Collect unique Performer NFTs on Polygon to enter tournaments
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Enter Tournaments</h3>
              <p className="text-muted-foreground">
                Join time-bound competitions with your favorite performers
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Earn Points</h3>
              <p className="text-muted-foreground">
                Score points based on your performer's scene actions
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Crown className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Climb Leaderboards</h3>
              <p className="text-muted-foreground">
                Compete for top rankings and bragging rights
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-20">
        <Card className="card-elevated">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Film className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-4xl font-bold mb-2">100+</p>
                <p className="text-muted-foreground">Movies Tracked</p>
              </div>
              <div>
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-4xl font-bold mb-2">50+</p>
                <p className="text-muted-foreground">Performers</p>
              </div>
              <div>
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-4xl font-bold mb-2">24/7</p>
                <p className="text-muted-foreground">Active Tournaments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Explore Section */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Explore the Platform</h2>
          <p className="text-muted-foreground">Everything you need to compete, collect, and win</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/performers", icon: Users, title: "Performer Directory", desc: "Browse all performers, view profiles, stats, and NFT cards.", color: "text-purple-500", bg: "bg-purple-500/10" },
            { href: "/tournaments", icon: Trophy, title: "Tournaments", desc: "Browse active and upcoming competitions. Enter with your NFT roster.", color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { href: "/leaderboard", icon: BarChart2, title: "Leaderboard", desc: "Top players and performers ranked by points. Weekly and all-time views.", color: "text-cyan-500", bg: "bg-cyan-500/10" },
            { href: "/marketplace", icon: ShoppingBag, title: "Marketplace", desc: "Buy, sell, and trade Performer NFT cards on the open market.", color: "text-green-500", bg: "bg-green-500/10" },
            { href: "/rules", icon: BookOpen, title: "Rules & Scoring", desc: "Learn how scoring works, badge bonuses, and tournament eligibility.", color: "text-blue-500", bg: "bg-blue-500/10" },
            { href: "/activity", icon: Zap, title: "Activity Feed", desc: "Stay up to date with new tournaments, scene results, and badge assignments.", color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map(({ href, icon: Icon, title, desc, color, bg }) => (
            <Link key={href} href={href}>
              <Card className="cursor-pointer hover:border-primary/50 transition-all h-full">
                <CardContent className="p-5 flex gap-4">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="card-elevated bg-card border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Compete?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your wallet, collect Performer NFTs, and start competing in tournaments today.
            </p>
            {user ? (
              <Link href="/tournaments">
                <Button size="lg" className="gap-2">
                  <Trophy className="h-5 w-5" />
                  View Tournaments
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
                Get Started Now
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-semibold">Porn Star League</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built on Polygon Network © 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
