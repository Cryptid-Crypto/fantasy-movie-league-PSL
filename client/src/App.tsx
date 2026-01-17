import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Web3Provider } from "./contexts/Web3Context";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Performers from "./pages/Performers";
import PerformerProfile from "./pages/PerformerProfile";
import PerformerStatistics from "./pages/PerformerStatistics";
import MyNFTs from "./pages/MyNFTs";
import Tournaments from "./pages/Tournaments";
import TournamentLeaderboard from "./pages/TournamentLeaderboard";
import TournamentEntry from "./pages/TournamentEntry";
import Dashboard from "./pages/Dashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/performers"} component={Performers} />
      <Route path={"/performers/:id"} component={PerformerProfile} />
      <Route path={"/performers/:id/statistics"} component={PerformerStatistics} />
      <Route path={"/my-nfts"} component={MyNFTs} />
      <Route path={"/tournaments"} component={Tournaments} />
      <Route path={"/tournaments/:id/enter"} component={TournamentEntry} />
      <Route path={"/tournaments/:id"} component={TournamentLeaderboard} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <Web3Provider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </Web3Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
