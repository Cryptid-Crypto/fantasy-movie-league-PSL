import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { LoginButton } from "@/components/LoginDialog";
import MobileNav from "@/components/MobileNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trophy, Users, BarChart2, ShoppingBag, BookOpen, Bell, Wallet, LayoutDashboard, UserCircle, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { href: "/performers", label: "Performers", icon: Users },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
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
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" title="Admin">
                      <LayoutDashboard className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-ring transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Account menu"
                    >
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback className="text-sm font-medium">
                          {user.name?.charAt(0).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium leading-none truncate">
                          {user.name || "Account"}
                        </p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => void logout()}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button variant="outline">Sign Up</Button>
                </Link>
                <LoginButton>Sign In</LoginButton>
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
