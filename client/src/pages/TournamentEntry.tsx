import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Check, X, Users } from "lucide-react";
import { toast } from "sonner";

export default function TournamentEntry() {
  const [, params] = useRoute("/tournaments/:id/enter");
  const [, navigate] = useLocation();
  const tournamentId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();

  const [selectedRoster, setSelectedRoster] = useState<Array<{ performerId: number; nftTokenId: string }>>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: tournament, isLoading: tournamentLoading } = trpc.tournaments.getById.useQuery(
    { id: tournamentId },
    { enabled: tournamentId > 0 }
  );

  const { data: requirements, isLoading: requirementsLoading } = trpc.tournaments.getRosterRequirements.useQuery(
    { tournamentId },
    { enabled: tournamentId > 0 }
  );

  const { data: userNfts, isLoading: nftsLoading } = trpc.nfts.list.useQuery(undefined, { enabled: !!user });

  // Check if user has existing entry
  const { data: existingEntry } = trpc.tournaments.getUserEntry.useQuery(
    { tournamentId },
    { enabled: !!user && tournamentId > 0 }
  );

  // Load existing roster if in edit mode
  const { data: existingRoster } = trpc.tournaments.getEntryPerformers.useQuery(
    { entryId: existingEntry?.id || 0 },
    { enabled: !!existingEntry }
  );

  // Initialize roster with existing data when editing
  useEffect(() => {
    if (existingEntry && existingRoster && existingRoster.length > 0) {
      setIsEditMode(true);
      setSelectedRoster(
        existingRoster.map((ep) => ({
          performerId: ep.performerId,
          nftTokenId: ep.nftTokenId,
        }))
      );
    }
  }, [existingEntry, existingRoster]);

  const enterMutation = trpc.tournaments.enter.useMutation({
    onSuccess: () => {
      toast.success("Successfully entered tournament!");
      navigate(`/tournaments/${tournamentId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.tournaments.updateEntry.useMutation({
    onSuccess: () => {
      toast.success("Roster updated successfully!");
      navigate(`/tournaments/${tournamentId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Check if roster meets requirements
  const validateRoster = () => {
    if (!requirements || requirements.length === 0) return { valid: true, unmet: [] };

    const unmet: string[] = [];

    for (const req of requirements) {
      const performerType = req.performerType;
      const requiredCount = req.requiredCount;

      if (performerType === null) {
        // "Any Type" requirement - just check total count
        if (selectedRoster.length < requiredCount) {
          unmet.push(`${requiredCount} Any Type`);
        }
      } else {
        // Specific type requirement
        const matchingPerformers = selectedRoster.filter((selected) => {
          const nft = userNfts?.find((n) => n.performerId === selected.performerId);
          return nft?.performerType === performerType;
        });

        if (matchingPerformers.length < requiredCount) {
          unmet.push(`${requiredCount} ${performerType}`);
        }
      }
    }

    return { valid: unmet.length === 0, unmet };
  };

  const { valid: isRosterValid, unmet: unmetRequirements } = validateRoster();

  const togglePerformer = (performerId: number, nftTokenId: string) => {
    const isSelected = selectedRoster.some((p) => p.performerId === performerId);

    if (isSelected) {
      setSelectedRoster(selectedRoster.filter((p) => p.performerId !== performerId));
    } else {
      setSelectedRoster([...selectedRoster, { performerId, nftTokenId }]);
    }
  };

  const handleSubmit = () => {
    if (!isRosterValid) {
      toast.error("Roster does not meet requirements");
      return;
    }

    if (isEditMode) {
      updateMutation.mutate({
        tournamentId,
        roster: selectedRoster,
      });
    } else {
      enterMutation.mutate({
        tournamentId,
        roster: selectedRoster,
      });
    }
  };

  if (tournamentLoading || requirementsLoading || nftsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Please sign in to enter tournaments</p>
          <Link href="/tournaments">
            <Button>Back to Tournaments</Button>
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
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tournaments
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">{tournament.name}</h1>
          </div>
          <p className="text-muted-foreground">
            {isEditMode ? "Edit your roster for this tournament" : "Build your roster to enter the tournament"}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Roster Requirements Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Roster Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requirements && requirements.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {requirements.map((req, index) => {
                        const performerType = req.performerType || "Any Type";
                        const requiredCount = req.requiredCount;

                        // Count how many of this type are selected
                        let selectedCount = 0;
                        if (req.performerType === null) {
                          selectedCount = selectedRoster.length;
                        } else {
                          selectedCount = selectedRoster.filter((selected) => {
                            const nft = userNfts?.find((n) => n.performerId === selected.performerId);
                            return nft?.performerType === req.performerType;
                          }).length;
                        }

                        const isMet = selectedCount >= requiredCount;

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isMet ? "border-green-500/50 bg-green-500/10" : "border-border bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isMet ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">
                                {requiredCount} {performerType}
                              </span>
                            </div>
                            <Badge variant={isMet ? "default" : "secondary"}>
                              {selectedCount}/{requiredCount}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Total Selected:</span>
                        <Badge variant="outline">{selectedRoster.length}</Badge>
                      </div>
                      {!isRosterValid && unmetRequirements.length > 0 && (
                        <p className="text-sm text-destructive">
                          Missing: {unmetRequirements.join(", ")}
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={!isRosterValid || enterMutation.isPending || updateMutation.isPending}
                    >
                      {isEditMode
                        ? (updateMutation.isPending ? "Updating..." : "Update Roster")
                        : (enterMutation.isPending ? "Entering..." : "Enter Tournament")}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific requirements</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* NFT Selection Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Performer NFTs</CardTitle>
                <CardDescription>Select performers to build your roster</CardDescription>
              </CardHeader>
              <CardContent>
                {userNfts && userNfts.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {userNfts.map((nft) => {
                      const isSelected = selectedRoster.some((p) => p.performerId === nft.performerId);

                      return (
                        <div
                          key={nft.id}
                          onClick={() => togglePerformer(nft.performerId, nft.tokenId)}
                          className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-primary text-primary-foreground rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {nft.performerImage ? (
                              <img
                                src={nft.performerImage}
                                alt={nft.performerName || "Performer"}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <Users className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{nft.performerName}</h3>
                              <p className="text-sm text-muted-foreground font-mono">#{nft.tokenId}</p>
                              {nft.performerType && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {nft.performerType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-xl mb-2 text-muted-foreground">No NFTs Found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need Performer NFTs to enter tournaments
                    </p>
                    <Link href="/my-nfts">
                      <Button>View My NFTs</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
