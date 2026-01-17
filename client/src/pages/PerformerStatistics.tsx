import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Film, Clapperboard, Target, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function PerformerStatistics() {
  const params = useParams();
  const performerId = parseInt(params.id || "0");

  const { data: performer, isLoading: performerLoading } = trpc.performers.getById.useQuery({ id: performerId });
  const { data: stats, isLoading: statsLoading } = trpc.performers.getStatistics.useQuery({ performerId });
  const { data: movies, isLoading: moviesLoading } = trpc.performers.getMovies.useQuery({ performerId });

  if (performerLoading || statsLoading || moviesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!performer || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4">Performer Not Found</h1>
        <Link href="/performers">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Performers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src="/PornStarLeagueLogoTB.png" alt="Porn Star League" className="h-8 w-8" />
              <span className="text-xl font-bold">Porn Star League</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/performers">
              <Button variant="ghost">Performers</Button>
            </Link>
            <Link href="/tournaments">
              <Button variant="ghost">Tournaments</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Link href={`/performers/${performerId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>

        {/* Performer Header */}
        <div className="flex items-start gap-6 mb-8">
          {performer.imageUrl && (
            <img
              src={performer.imageUrl}
              alt={performer.name}
              className="w-32 h-32 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{performer.name}</h1>
            {performer.performerType && (
              <Badge variant="secondary" className="mb-4">
                {performer.performerType}
              </Badge>
            )}
            <p className="text-muted-foreground text-lg">Performance Statistics</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all scenes
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalActions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Actions performed
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scenes</CardTitle>
              <Clapperboard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalScenes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total scenes
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Points/Scene</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averagePointsPerScene.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per scene average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Breakdown */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <CardTitle>Action Breakdown</CardTitle>
            <CardDescription>Performance by action type</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.actionBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No actions recorded yet</p>
            ) : (
              <div className="space-y-4">
                {stats.actionBreakdown.map((action: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{action.actionName}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.count} times × {action.actionPoints} points
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{action.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">total points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movies */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Movies ({stats.totalMovies})
            </CardTitle>
            <CardDescription>Films featuring {performer.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {!movies || movies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No movies yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movies.map((movie: any) => (
                  <div key={movie.id} className="p-4 bg-muted/30 rounded-lg hover-lift">
                    <h3 className="font-semibold mb-1">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
