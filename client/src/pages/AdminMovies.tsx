import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { MoviesManager } from "@/components/admin/MoviesManager";
import { Shield, Film, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function AdminMovies() {
  const { user, loading } = useAuth();

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

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">This page is only accessible to platform administrators.</p>
            {!user ? (
              <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
            ) : (
              <Link href="/"><Button variant="outline">Back to Home</Button></Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3 w-3" />
              Admin Dashboard
            </Button>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Movie & Scene Manager</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Film className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold">Movie & Scene Manager</h1>
              <Badge variant="outline" className="text-primary border-primary">Admin</Badge>
            </div>
            <p className="text-muted-foreground">
              Add movies, link performers to scenes, describe scene types, and assign scoring actions.
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        </div>

        {/* Manager Component */}
        <Card>
          <CardHeader>
            <CardTitle>Movies & Scenes</CardTitle>
            <CardDescription>
              Manage all movies and their scenes. Add performers to scenes and log their actions to award points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoviesManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
