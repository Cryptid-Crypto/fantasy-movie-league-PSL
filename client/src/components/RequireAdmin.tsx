import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return null;
  }
  if (!user || user.role !== "admin") {
    return null; // redirect happens in effect
  }
  return <>{children}</>;
}