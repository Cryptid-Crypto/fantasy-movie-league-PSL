import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "psl-age-verified";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setVerified(!!stored);
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (verified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Adults Only — 18+</h1>
          <p className="text-muted-foreground text-sm">
            This website contains adult-oriented content. By entering you confirm
            that you are at least 18 years old (or the age of majority in your
            jurisdiction) and that viewing adult content is legal where you live.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, new Date().toISOString());
              setVerified(true);
            }}
          >
            I am 18 or older — Enter
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}