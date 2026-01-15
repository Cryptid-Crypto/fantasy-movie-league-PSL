import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, ArrowLeft, User, Crown } from "lucide-react";
import { Link } from "wouter";

export default function TournamentLeaderboard() {
  const [, params] = useRoute("/tournaments/:id");
  const tournamentId = params?.id ? parseInt(params.id) : 0;

  const { data: tournament, isLoading: tournamentLoading } = trpc.tournaments.getById.useQuery(
    { id: tournamentId },
    { enabled: tournamentId > 0 }
  );

  const { data: leaderboard, isLoading: leaderboardLoading } = trpc.tournaments.getLeaderboard.useQuery(
    { tournamentId },
    { enabled: tournamentId > 0 }
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getStatusBadge = (tournament: any) => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    const end = new Date(tournament.endDate);

    if (now < start) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (now > end) {
      return <Badge variant="outline">Completed</Badge>;
    } else {
      return <Badge className="bg-accent text-accent-foreground">Active</Badge>;
    }
  };

  if (tournamentLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Tournament not found</p>
          <Link href="/tournaments">
            <Button>View All Tournaments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="container py-6">
          <Link href="/tournaments">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Tournaments
            </Button>
          </Link>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Tournament Info */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="h-12 w-12 text-primary" />
                <div>
                  <CardTitle className="text-3xl mb-2">{tournament.name}</CardTitle>
                  {tournament.description && (
                    <CardDescription className="text-base">{tournament.description}</CardDescription>
                  )}
                </div>
              </div>
              {getStatusBadge(tournament)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="font-semibold">
                  {new Date(tournament.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <p className="font-semibold">
                  {new Date(tournament.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Participants</p>
                <p className="font-semibold">{leaderboard?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Performer</TableHead>
                      <TableHead>NFT Token</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry, index) => (
                      <TableRow
                        key={entry.id}
                        className={index < 3 ? "bg-muted/30" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRankIcon(index + 1)}
                            <span className="font-semibold">#{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{entry.userName || "Anonymous"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {entry.performerImage ? (
                              <img
                                src={entry.performerImage}
                                alt={entry.performerName || "Performer"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{entry.performerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          #{entry.nftTokenId}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={index === 0 ? "default" : "outline"}
                            className={
                              index === 0
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }
                          >
                            {entry.totalScore} pts
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">No Entries Yet</p>
                <p className="text-sm">Be the first to enter this tournament!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
