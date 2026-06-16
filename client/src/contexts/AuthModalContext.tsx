import { createContext, useContext, useState, ReactNode } from "react";
import { AuthModal } from "@/components/AuthModal";

interface AuthModalContextValue {
  openLogin: () => void;
  openRegister: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  openLogin: () => {},
  openRegister: () => {},
});

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");

  const openLogin = () => { setTab("login"); setOpen(true); };
  const openRegister = () => { setTab("register"); setOpen(true); };

  return (
    <AuthModalContext.Provider value={{ openLogin, openRegister }}>
      {children}
      <AuthModal open={open} onOpenChange={setOpen} defaultTab={tab} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
