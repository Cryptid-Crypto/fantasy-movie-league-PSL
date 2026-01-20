import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Trophy, Users, Wallet, LayoutDashboard, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const closeSheet = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="PSL" className="h-8 w-8" />
                <span className="text-lg font-bold">PSL</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSheet}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/performers" onClick={closeSheet}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
              >
                <Users className="h-5 w-5" />
                <span className="text-base">Performers</span>
              </Button>
            </Link>

            <Link href="/tournaments" onClick={closeSheet}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
              >
                <Trophy className="h-5 w-5" />
                <span className="text-base">Tournaments</span>
              </Button>
            </Link>

            {user && (
              <>
                <Link href="/dashboard" onClick={closeSheet}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-base">Dashboard</span>
                  </Button>
                </Link>

                <Link href="/my-nfts" onClick={closeSheet}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12"
                  >
                    <Wallet className="h-5 w-5" />
                    <span className="text-base">My NFTs</span>
                  </Button>
                </Link>
              </>
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
              <Button
                className="w-full h-12"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
