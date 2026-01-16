import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Users, Zap, Trophy } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { MoviesManager } from "@/components/admin/MoviesManager";
import { PerformersManager } from "@/components/admin/PerformersManager";
import { ActionsManager } from "@/components/admin/ActionsManager";
import { TournamentsManager } from "@/components/admin/TournamentsManager";

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const [, setLocation] = useLocation();

  if (!user) {
    // Not logged in - redirect to login
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== 'admin') {
    // Logged in but not admin - redirect to home
    setLocation('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage platform content and tournaments</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="movies" className="gap-2">
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Movies</span>
            </TabsTrigger>
            <TabsTrigger value="performers" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Performers</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Tournaments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Movie Management</CardTitle>
                <CardDescription>
                  Add and manage movies, scenes, and performer actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MoviesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performer Management</CardTitle>
                <CardDescription>
                  Manage performer profiles and NFT contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformersManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Action Types</CardTitle>
                <CardDescription>
                  Define action types and their point values for scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActionsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Management</CardTitle>
                <CardDescription>
                  Create and manage tournaments with NFT-gated entry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TournamentsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
