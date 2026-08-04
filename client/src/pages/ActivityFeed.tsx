import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Bell, Trophy, Film, Sparkles, Star, TrendingUp, Clock, Users } from "lucide-react";

type ActivityItem = {
  id: string;
  type: "tournament_new" | "tournament_active" | "tournament_ended" | "scene_logged" | "nft_trade" | "badge_assigned";
  title: string;
  description: string;
  timestamp: Date;
  link?: string;
  badge?: string;
};

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const icons: Record<ActivityItem["type"], React.ReactNode> = {
    tournament_new: <Trophy className="h-4 w-4 text-yellow-500" />,
    tournament_active: <Trophy className="h-4 w-4 text-green-500" />,
    tournament_ended: <Trophy className="h-4 w-4 text-muted-foreground" />,
    scene_logged: <Film className="h-4 w-4 text-blue-500" />,
    nft_trade: <Sparkles className="h-4 w-4 text-purple-500" />,
    badge_assigned: <Star className="h-4 w-4 text-primary" />,
  };
  return (
    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
      {icons[type]}
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ActivityFeed() {
  const { data: stats, isLoading: statsLoading } = trpc.stats.public.useQuery();
  const { data: tournaments } = trpc.tournaments.list.useQuery();
  const { data: performers } = trpc.performers.list.useQuery();
  const { data: performerRankings } = trpc.leaderboard.performers.useQuery();

  // Build activity feed from real data
  const activities: ActivityItem[] = [];

  // Tournament events
  if (tournaments) {
    tournaments.forEach((t: any) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      const now = new Date();
      const createdAt = t.createdAt ? new Date(t.createdAt) : start;

      if (t.status === "upcoming" && start > now) {
        // Upcoming tournament — show when it was created
        activities.push({
          id: `t-new-${t.id}`,
          type: "tournament_new",
          title: "New Tournament Announced",
          description: `"${t.name}" opens for entries soon. Starts ${start.toLocaleDateString()}.`,
          timestamp: createdAt,
          link: `/tournaments/${t.id}`,
        });
      } else if (t.status === "active" && start <= now && end >= now) {
        // Active tournament
        activities.push({
          id: `t-active-${t.id}`,
          type: "tournament_active",
          title: "Tournament In Progress",
          description: `"${t.name}" is live! Ends ${end.toLocaleDateString()}.`,
          timestamp: start,
          link: `/tournaments/${t.id}`,
        });
      } else if (t.status === "completed" || end < now) {
        activities.push({
          id: `t-end-${t.id}`,
          type: "tournament_ended",
          title: "Tournament Completed",
          description: `"${t.name}" has concluded. View the final leaderboard.`,
          timestamp: end,
          link: `/tournaments/${t.id}`,
        });
      }
    });
  }

  // Top performer highlights (real data from leaderboard)
  if (performerRankings && performerRankings.length > 0) {
    // Top 3 performers get featured
    performerRankings.slice(0, 3).forEach((p: any) => {
      activities.push({
        id: `top-perf-${p.id}`,
        type: "scene_logged",
        title: `${p.name} Leads Rankings`,
        description: `${p.name} has ${p.totalPoints} points across ${p.sceneCount} scenes — ranked in the top performers.`,
        timestamp: new Date(Date.now() - 3600000), // ~1 hour ago
        link: `/performers/${p.id}`,
      });
    });
  }

  // Badge assignments for performers with types
  if (performers) {
    performers.forEach((p: any) => {
      if (p.performerType) {
        activities.push({
          id: `badge-${p.id}`,
          type: "badge_assigned",
          title: "Badge Awarded",
          description: `${p.name} recognized as "${p.performerType}".`,
          timestamp: p.createdAt ? new Date(p.createdAt) : new Date(Date.now() - 86400000),
          link: `/performers/${p.id}`,
          badge: p.performerType,
        });
      }
    });
  }

  // Sort by most recent, limit to 30 items
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentActivities = activities.slice(0, 30);

  const activeCount = tournaments?.filter(
    (t: any) => t.status === "active"
  ).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                Activity Feed
              </h1>
              <p className="text-muted-foreground mt-1">Latest events across the Porn Star League platform</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Live
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Active Tournaments", value: activeCount, icon: Trophy },
              { label: "Performers", value: stats?.performerCount ?? (performers?.length ?? 0), icon: Users },
              { label: "Recent Events", value: recentActivities.length, icon: Bell },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  {statsLoading ? (
                    <div className="h-7 w-12 bg-muted rounded animate-pulse mx-auto mb-0.5" />
                  ) : (
                    <p className="text-xl font-bold">{value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Platform events, tournament updates, and performer highlights</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No activity yet. Check back after tournaments begin!</p>
                  <Link href="/tournaments">
                    <Button variant="outline" className="gap-2">
                      <Trophy className="h-4 w-4" />
                      Browse Tournaments
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentActivities.map((item, idx) => (
                    <div key={item.id}>
                      {idx > 0 && <div className="border-t border-border/50 my-1" />}
                      <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <ActivityIcon type={item.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{item.title}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {timeAgo(item.timestamp)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs mt-1 text-primary border-primary">
                              {item.badge}
                            </Badge>
                          )}
                          {item.link && (
                            <Link href={item.link}>
                              <Button variant="link" className="h-auto p-0 text-xs text-primary mt-1">
                                View details →
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}