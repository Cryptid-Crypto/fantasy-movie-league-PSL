import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, Star, Medal, Crown, Users, Film } from "lucide-react";

const RANK_STYLES: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-500", icon: <Crown className="h-5 w-5 text-yellow-500" /> },
  2: { bg: "bg-slate-400/10 border-slate-400/30", text: "text-slate-400", icon: <Medal className="h-5 w-5 text-slate-400" /> },
  3: { bg: "bg-amber-700/10 border-amber-700/30", text: "text-amber-700", icon: <Medal className="h-5 w-5 text-amber-700" /> },
};

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${style.bg}`}>
        {style.icon}
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
      {rank}
    </div>
  );
}

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "alltime">("alltime");
  const { data: performers, isLoading } = trpc.performers.list.useQuery();
  const { data: tournaments } = trpc.tournaments.list.useQuery();

  // Build a sorted performer leaderboard from available data
  const performerRankings = (performers ?? [])
    .map((p: any) => ({ ...p, totalPoints: p.totalPoints ?? 0 }))
    .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                Leaderboard
              </h1>
              <p className="text-muted-foreground mt-1">Top players and performers ranked by points</p>
            </div>
            <div className="flex gap-2">
              {(["weekly", "monthly", "alltime"] as const).map((t) => (
                <Button
                  key={t}
                  variant={timeframe === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(t)}
                >
                  {t === "alltime" ? "All Time" : t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium */}
          {performerRankings.length >= 3 && (
            <div className="grid grid-cols-3 gap-4">
              {[1, 0, 2].map((idx) => {
                const p = performerRankings[idx];
                const rank = idx + 1;
                const heights = ["h-32", "h-40", "h-28"];
                return (
                  <Link key={p.id} href={`/performers/${p.id}`}>
                    <Card className={`cursor-pointer hover:border-primary/50 transition-colors text-center overflow-hidden ${RANK_STYLES[rank]?.bg ?? ""}`}>
                      <div className={`${heights[idx === 1 ? 1 : idx === 0 ? 0 : 2]} flex flex-col items-center justify-end pb-4 pt-4 gap-2`}>
                        {p.portraitUrl || p.imageUrl ? (
                          <img src={p.portraitUrl ?? p.imageUrl} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                        ) : (
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="text-xl">{p.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-bold text-sm">{p.name}</p>
                          <p className={`text-xs font-semibold ${RANK_STYLES[rank]?.text ?? ""}`}>
                            #{rank} · {p.totalPoints} pts
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="performers">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="performers" className="gap-2">
                <Users className="h-4 w-4" />
                Top Performers
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="gap-2">
                <Trophy className="h-4 w-4" />
                Tournament Results
              </TabsTrigger>
            </TabsList>

            {/* Performers Leaderboard */}
            <TabsContent value="performers" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performer Rankings</CardTitle>
                  <CardDescription>Ranked by total scene performance points</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : performerRankings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3" />
                      <p>No ranking data available yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {performerRankings.map((p: any, idx: number) => {
                        const rank = idx + 1;
                        return (
                          <Link key={p.id} href={`/performers/${p.id}`}>
                            <div className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${RANK_STYLES[rank]?.bg ?? "border-border"}`}>
                              <RankBadge rank={rank} />
                              {p.portraitUrl || p.imageUrl ? (
                                <img src={p.portraitUrl ?? p.imageUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback>{p.name.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{p.name}</p>
                                {p.performerType && (
                                  <Badge variant="outline" className="text-xs">{p.performerType}</Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className={`font-bold ${RANK_STYLES[rank]?.text ?? "text-foreground"}`}>
                                  {p.totalPoints ?? 0} pts
                                </p>
                                <p className="text-xs text-muted-foreground">Total Points</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tournament Results */}
            <TabsContent value="tournaments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tournament Results</CardTitle>
                  <CardDescription>Past competition winners and prize distributions</CardDescription>
                </CardHeader>
                <CardContent>
                  {!tournaments || tournaments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Film className="h-12 w-12 mx-auto mb-3" />
                      <p>No completed tournaments yet.</p>
                      <Link href="/tournaments">
                        <Button variant="outline" className="mt-4 gap-2">
                          <Trophy className="h-4 w-4" />
                          Browse Tournaments
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tournaments
                        .filter((t: any) => new Date(t.endDate) < new Date())
                        .map((t: any) => (
                          <Link key={t.id} href={`/tournaments/${t.id}`}>
                            <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                              <Trophy className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-semibold">{t.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Ended {new Date(t.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              {t.prizePool && (
                                <Badge variant="outline" className="text-primary border-primary">
                                  {t.prizePool} MATIC
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))}
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
