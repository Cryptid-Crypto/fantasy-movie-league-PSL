import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Trophy, Calendar, Users, ArrowLeft, Lock } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { TournamentRosterRequirements } from "@/components/TournamentRosterRequirements";

export default function Tournaments() {
  const { user } = useAuth();


  const utils = trpc.useUtils();
  const { data: tournaments, isLoading } = trpc.tournaments.list.useQuery();
  const { data: userNfts } = trpc.nfts.list.useQuery(undefined, { enabled: !!user });
  
  // Fetch all user entries at once
  const { data: userEntries } = trpc.tournaments.getAllUserEntries.useQuery(undefined, { enabled: !!user });
  
  // Create a Set of tournament IDs the user has entered
  const enteredTournamentIds = new Set(userEntries?.map(entry => entry.tournamentId) || []);

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

  const getAvailableNFTs = (tournament: any) => {
    if (!userNfts) return [];
    
    // If tournament requires specific contract, filter by that
    if (tournament.requiredNftContractAddress) {
      return userNfts.filter(
        (nft) => nft.contractAddress.toLowerCase() === tournament.requiredNftContractAddress.toLowerCase()
      );
    }
    
    // Otherwise, all NFTs are valid
    return userNfts;
  };

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
          <h1 className="text-4xl font-bold mb-2">Tournaments</h1>
          <p className="text-muted-foreground">
            Compete with your Performer NFTs for glory and prizes
          </p>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tournaments...</p>
          </div>
        ) : tournaments && tournaments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => {
              const availableNFTs = getAvailableNFTs(tournament);
              const canEnter = user && availableNFTs.length > 0;
              const now = new Date();
              const isActive = now >= new Date(tournament.startDate) && now <= new Date(tournament.endDate);

              return (
                <Card key={tournament.id} className="flex flex-col hover-lift transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Trophy className="h-8 w-8 text-primary" />
                      {getStatusBadge(tournament)}
                    </div>
                    <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                    {tournament.description && (
                      <CardDescription>{tournament.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                          {new Date(tournament.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {tournament.entryFee && parseFloat(tournament.entryFee) > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Entry Fee:</span>
                          <Badge variant="outline">{tournament.entryFee} MATIC</Badge>
                        </div>
                      )}
                      {tournament.requiredNftContractAddress && (
                        <div className="flex items-center gap-2 text-sm">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono">
                            Requires specific NFT
                          </span>
                        </div>
                      )}
                      <TournamentRosterRequirements tournamentId={tournament.id} />
                    </div>

                    <div className="space-y-2">
                      <Link href={`/tournaments/${tournament.id}`}>
                        <Button variant="outline" className="w-full gap-2">
                          <Users className="h-4 w-4" />
                          View Leaderboard
                        </Button>
                      </Link>

                      {isActive && (
                        user ? (
                          enteredTournamentIds.has(tournament.id) ? (
                            <Link href={`/tournaments/${tournament.id}/enter`}>
                              <Button variant="secondary" className="w-full">
                                Edit Roster
                              </Button>
                            </Link>
                          ) : canEnter ? (
                            <Link href={`/tournaments/${tournament.id}/enter`}>
                              <Button className="w-full">
                                Enter Tournament
                              </Button>
                            </Link>
                          ) : (
                            <Button disabled className="w-full">
                              No Eligible NFTs
                            </Button>
                          )
                        ) : (
                          <Button
                            onClick={() => (window.location.href = getLoginUrl())}
                            className="w-full"
                          >
                            Sign In to Enter
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">No Tournaments Available</p>
              <p className="text-sm text-muted-foreground">Check back later for new competitions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
