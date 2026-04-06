import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu, Trophy, Users, Wallet, LayoutDashboard, X,
  BarChart2, ShoppingBag, BookOpen, Bell, UserCircle, Film, Sparkles
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const closeSheet = () => setOpen(false);

  const publicLinks = [
    { href: "/performers", label: "Performers", icon: Users },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/rules", label: "Rules & Scoring", icon: BookOpen },
  ];

  const userLinks = [
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/my-nfts", label: "My NFTs", icon: Wallet },
    { href: "/activity", label: "Activity Feed", icon: Bell },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
    { href: "/admin/movies", label: "Movie & Scene Manager", icon: Film },
    { href: "/admin/tournaments/create", label: "Create Competition", icon: Trophy },
    { href: "/nft-studio", label: "NFT Studio", icon: Sparkles },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="PSL" className="h-8 w-8" />
                <span className="text-lg font-bold">Porn Star League</span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeSheet} className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Explore</p>
            {publicLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={closeSheet}>
                <Button variant="ghost" className="w-full justify-start gap-3 h-11">
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}

            {user && (
              <>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">My Account</p>
                  {userLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={closeSheet}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-11">
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {user?.role === "admin" && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Admin</p>
                {adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={closeSheet}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-primary">
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Footer CTA */}
          <div className="p-4 border-t border-border">
            {user ? (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Signed in as</p>
                <p className="font-medium truncate">{user.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/signup" onClick={closeSheet}>
                  <Button variant="outline" className="w-full h-11">Sign Up</Button>
                </Link>
                <Button className="w-full h-11" onClick={() => { window.location.href = getLoginUrl(); }}>
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
