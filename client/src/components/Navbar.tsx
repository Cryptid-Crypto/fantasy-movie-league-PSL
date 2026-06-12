import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import MobileNav from "@/components/MobileNav";
import { Trophy, Users, BarChart2, ShoppingBag, BookOpen, Bell, Wallet, LayoutDashboard, UserCircle, Package } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { href: "/performers", label: "Performers", icon: Users },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/marketplace/packs", label: "Pack Shop", icon: Package },
    { href: "/rules", label: "Rules", icon: BookOpen },
  ];

  return (
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
                <Link href="/profile">
                  <Button className="gap-2">
                    <UserCircle className="h-4 w-4" />
                    My Profile
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" title="Admin">
                      <LayoutDashboard className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button variant="outline">Sign Up</Button>
                </Link>
                <Button onClick={() => (window.location.href = getLoginUrl())}>
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile Nav */}
          <MobileNav />
        </div>
      </div>
    </nav>
  );
}
