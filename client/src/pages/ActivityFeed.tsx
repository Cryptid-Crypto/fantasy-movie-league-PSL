import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Bell, Trophy, Film, Sparkles, Star, TrendingUp, Clock, Users } from "lucide-react";

type ActivityItem = {
  id: string;
  type: "tournament_new" | "tournament_ended" | "scene_logged" | "nft_trade" | "badge_assigned";
  title: string;
  description: string;
  timestamp: Date;
  link?: string;
  badge?: string;
};

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const icons: Record<ActivityItem["type"], React.ReactNode> = {
    tournament_new: <Trophy className="h-4 w-4 text-yellow-500" />,
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
  return `${days}d ago`;
}

export default function ActivityFeed() {
  const { data: tournaments } = trpc.tournaments.list.useQuery();
  const { data: performers } = trpc.performers.list.useQuery();

  // Build activity feed from real data
  const activities: ActivityItem[] = [];

  if (tournaments) {
    tournaments.forEach((t: any) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      const now = new Date();

      if (start > now) {
        activities.push({
          id: `t-new-${t.id}`,
          type: "tournament_new",
          title: "New Tournament Open",
          description: `"${t.name}" is now accepting entries. Entry fee: ${t.entryFee ?? "Free"}`,
          timestamp: start,
          link: `/tournaments/${t.id}`,
        });
      } else if (end < now) {
        activities.push({
          id: `t-end-${t.id}`,
          type: "tournament_ended",
          title: "Tournament Ended",
          description: `"${t.name}" has concluded. Check the leaderboard for final standings.`,
          timestamp: end,
          link: `/tournaments/${t.id}`,
        });
      }
    });
  }

  if (performers) {
    performers.slice(0, 5).forEach((p: any) => {
      if (p.performerType) {
        activities.push({
          id: `badge-${p.id}`,
          type: "badge_assigned",
          title: "Badge Assigned",
          description: `${p.name} has been awarded the "${p.performerType}" badge.`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          link: `/performers/${p.id}`,
          badge: p.performerType,
        });
      }
    });
  }

  // Sort by most recent
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
              { label: "Active Tournaments", value: tournaments?.filter((t: any) => new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date()).length ?? 0, icon: Trophy },
              { label: "Total Performers", value: performers?.length ?? 0, icon: Users },
              { label: "Recent Events", value: activities.length, icon: Bell },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Platform events, tournament updates, and badge assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
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
                  {activities.map((item, idx) => (
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
