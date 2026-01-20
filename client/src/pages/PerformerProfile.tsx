import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ArrowLeft, Film, Zap } from "lucide-react";
import { Link } from "wouter";

export default function PerformerProfile() {
  const [, params] = useRoute("/performers/:id");
  const performerId = params?.id ? parseInt(params.id) : 0;

  const { data: performer, isLoading } = trpc.performers.getById.useQuery(
    { id: performerId },
    { enabled: performerId > 0 }
  );

  const { data: recentPerformances } = trpc.performers.getRecentPerformances.useQuery(
    { performerId, limit: 20 },
    { enabled: performerId > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performer...</p>
        </div>
      </div>
    );
  }

  if (!performer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Performer not found</p>
          <Link href="/">
            <Button>Go Home</Button>
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
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden card-elevated">
              <div className="aspect-[3/4] relative bg-muted">
                {performer.imageUrl ? (
                  <img
                    src={performer.imageUrl}
                    alt={performer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{performer.name}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {performer.performerType && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {performer.performerType}
                      </Badge>
                    )}
                    {performer.nftContractAddress && (
                      <>
                        <Badge variant="outline" className="font-mono text-xs">
                          NFT Contract
                        </Badge>
                        <span className="text-accent font-mono text-xs">
                          {performer.nftContractAddress.slice(0, 6)}...
                          {performer.nftContractAddress.slice(-4)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {performer.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Bio
                    </h3>
                    <p className="text-foreground leading-relaxed">{performer.bio}</p>
                  </div>
                )}
                <Link href={`/performers/${performerId}/statistics`}>
                  <Button className="w-full" variant="outline">
                    <Zap className="mr-2 h-4 w-4" />
                    View Statistics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Performances */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  Recent Performances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPerformances && recentPerformances.length > 0 ? (
                  <div className="space-y-4">
                    {recentPerformances.map((performance, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Film className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold text-foreground">
                              {performance.movieTitle}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>
                              Scene {performance.sceneNumber || "—"}
                              {performance.sceneTitle && `: ${performance.sceneTitle}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-accent" />
                            <span className="text-sm font-medium text-accent">
                              {performance.actionName}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            +{performance.actionPoints} pts
                          </Badge>
                          {performance.movieReleaseDate && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(performance.movieReleaseDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performances recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {recentPerformances?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Actions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-accent">
                      {recentPerformances?.reduce((sum, p) => sum + (p.actionPoints || 0), 0) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {recentPerformances && recentPerformances.length > 0
                        ? Math.round(
                            recentPerformances.reduce((sum, p) => sum + (p.actionPoints || 0), 0) /
                              recentPerformances.length
                          )
                        : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
