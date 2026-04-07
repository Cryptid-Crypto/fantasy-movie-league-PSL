import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  Film, Users, Zap, Trophy, Sparkles, BarChart2,
  Shield, ArrowRight, Settings, History, Plus
} from "lucide-react";

const MODULE_CARDS = [
  {
    title: "Movie & Scene Manager",
    description: "Add movies, link performers to scenes, log scene actions and assign scoring.",
    icon: Film,
    href: "/admin/movies",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    badge: "Content",
  },
  {
    title: "Performer Manager",
    description: "Manage performer profiles, portraits, badges, and NFT card generation.",
    icon: Users,
    href: "/admin/performers",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    badge: "Roster",
  },
  {
    title: "Create Competition",
    description: "Set up a new tournament with custom roster requirements, entry fees, and prize pools.",
    icon: Plus,
    href: "/admin/tournaments/create",
    color: "text-green-500",
    bg: "bg-green-500/10",
    badge: "New",
    highlight: true,
  },
  {
    title: "Tournament Manager",
    description: "View, edit, and manage all active, upcoming, and past tournaments.",
    icon: Trophy,
    href: "/admin",
    tabTarget: "tournaments",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    badge: "Events",
  },
  {
    title: "NFT Studio",
    description: "Generate and manage performer NFT cards. Assign badges and regenerate artwork.",
    icon: Sparkles,
    href: "/nft-studio",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    badge: "NFTs",
  },
  {
    title: "Action Types & Scoring",
    description: "Define action types and their point values used for tournament scoring.",
    icon: Zap,
    href: "/admin",
    tabTarget: "actions",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    badge: "Scoring",
  },
  {
    title: "Leaderboard",
    description: "View the current player and performer rankings across all tournaments.",
    icon: BarChart2,
    href: "/leaderboard",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    badge: "Stats",
  },
  {
    title: "User Transactions",
    description: "Review player transaction history, entry fees, and prize payouts.",
    icon: History,
    href: "/admin",
    tabTarget: "transactions",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    badge: "Finance",
  },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: performers } = trpc.performers.list.useQuery();
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
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const activeTournaments = (tournaments ?? []).filter(
    (t: any) => new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Badge variant="outline" className="text-primary border-primary">Admin</Badge>
              </div>
              <p className="text-muted-foreground">Manage all platform content, tournaments, and NFTs.</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Site
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Performers", value: performers?.length ?? 0, icon: Users, href: "/performers" },
              { label: "Tournaments", value: tournaments?.length ?? 0, icon: Trophy, href: "/tournaments" },
              { label: "Active Now", value: activeTournaments.length, icon: Zap, href: "/tournaments" },
              { label: "NFTs Generated", value: performers?.filter((p: any) => p.imageUrl).length ?? 0, icon: Sparkles, href: "/nft-studio" },
            ].map(({ label, value, icon: Icon, href }) => (
              <Link key={label} href={href}>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4 pb-3 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Module Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Management Modules</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MODULE_CARDS.map(({ title, description, icon: Icon, href, color, bg, badge, highlight }) => (
                <Link key={title} href={href}>
                  <Card className={`cursor-pointer hover:border-primary/50 transition-all h-full ${highlight ? "border-primary/40 bg-primary/5" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <Badge variant="outline" className="text-xs">{badge}</Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs leading-relaxed">{description}</CardDescription>
                      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${color}`}>
                        Open <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Legacy Tabs Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Management
              </CardTitle>
              <CardDescription>
                Direct access to management panels. For dedicated pages, use the module cards above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/performers">
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Performers
                  </Button>
                </Link>
                <Link href="/admin/movies">
                  <Button variant="outline" className="gap-2">
                    <Film className="h-4 w-4" />
                    Movies & Scenes
                  </Button>
                </Link>
                <Link href="/admin/tournaments/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Tournament
                  </Button>
                </Link>
                <Link href="/nft-studio">
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    NFT Studio
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" className="gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
