import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import MobileNav from "@/components/MobileNav";
import { AuthModal } from "@/components/AuthModal";
import { Trophy, Users, BarChart2, ShoppingBag, BookOpen, Bell, Wallet, LayoutDashboard, UserCircle, Package, LogOut, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  const openLogin = () => { setAuthTab("login"); setAuthOpen(true); };
  const openRegister = () => { setAuthTab("register"); setAuthOpen(true); };

  const navLinks = [
    { href: "/performers", label: "Performers", icon: Users },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/marketplace/packs", label: "Pack Shop", icon: Package },
    { href: "/rules", label: "Rules", icon: BookOpen },
  ];

  return (
    <>
      <nav className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="/logo.png" alt="Porn Star League" className="h-8 w-8" />
                <span className="text-xl font-bold text-foreground hidden sm:block">Porn Star League</span>
                <span className="text-xl font-bold text-foreground sm:hidden">PSL</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}>
                  <Button
                    variant="ghost"
                    className={location === href ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                  >
                    {label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/activity">
                    <Button variant="ghost" size="icon" title="Activity Feed">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/my-nfts">
                    <Button variant="outline" className="gap-2">
                      <Wallet className="h-4 w-4" />
                      My NFTs
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="gap-2">
                        <UserCircle className="h-4 w-4" />
                        {user.name || user.username || "My Account"}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <UserCircle className="h-4 w-4 mr-2" /> My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-nfts" className="cursor-pointer">
                          <Wallet className="h-4 w-4 mr-2" /> My NFTs
                        </Link>
                      </DropdownMenuItem>
                      {user.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={openLogin}>Sign In</Button>
                  <Button onClick={openRegister}>Sign Up</Button>
                </>
              )}
            </div>

            {/* Mobile Nav */}
            <MobileNav onOpenAuth={openLogin} onOpenRegister={openRegister} />
          </div>
        </div>
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </>
  );
}
