import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPrompt } from "@/components/InstallPrompt";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Web3Provider } from "./contexts/Web3Context";

// Public pages
import Home from "./pages/Home";
import Performers from "./pages/Performers";
import PerformerProfile from "./pages/PerformerProfile";
import PerformerStatistics from "./pages/PerformerStatistics";
import Tournaments from "./pages/Tournaments";
import TournamentLeaderboard from "./pages/TournamentLeaderboard";
import TournamentEntry from "./pages/TournamentEntry";
import Leaderboard from "./pages/Leaderboard";
import Marketplace from "./pages/Marketplace";
import Rules from "./pages/Rules";
import ActivityFeed from "./pages/ActivityFeed";
import Signup from "./pages/Signup";

// Authenticated user pages
import Dashboard from "./pages/Dashboard";
import MyNFTs from "./pages/MyNFTs";
import PlayerProfile from "./pages/PlayerProfile";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminMovies from "./pages/AdminMovies";
import AdminCreateTournament from "./pages/AdminCreateTournament";
import AdminPerformers from "./pages/AdminPerformers";
import NFTStudio from "./pages/NFTStudio";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/performers" component={Performers} />
      <Route path="/performers/:id" component={PerformerProfile} />
      <Route path="/performers/:id/statistics" component={PerformerStatistics} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournaments/:id/enter" component={TournamentEntry} />
      <Route path="/tournaments/:id" component={TournamentLeaderboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/rules" component={Rules} />
      <Route path="/activity" component={ActivityFeed} />

      {/* Authenticated user */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/my-nfts" component={MyNFTs} />
      <Route path="/profile" component={PlayerProfile} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/movies" component={AdminMovies} />
      <Route path="/admin/performers" component={AdminPerformers} />
      <Route path="/admin/tournaments/create" component={AdminCreateTournament} />
      <Route path="/nft-studio" component={NFTStudio} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Web3Provider>
          <TooltipProvider>
            <Toaster />
            <InstallPrompt />
            <Router />
          </TooltipProvider>
        </Web3Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
