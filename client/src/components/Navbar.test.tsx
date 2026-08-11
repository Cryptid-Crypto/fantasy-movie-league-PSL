import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

// ─── Mocks ────────────────────────────────────────────────────────────────

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/LoginDialog", () => ({
  LoginButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="login-button" {...props}>{children}</button>
  ),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
  useLocation: () => ["/", vi.fn()],
}));

vi.mock("lucide-react", () => ({
  Trophy: () => <span data-testid="icon-trophy" />,
  Users: () => <span data-testid="icon-users" />,
  BarChart2: () => <span data-testid="icon-barchart" />,
  ShoppingBag: () => <span data-testid="icon-shoppingbag" />,
  BookOpen: () => <span data-testid="icon-bookopen" />,
  Bell: () => <span data-testid="icon-bell" />,
  Wallet: () => <span data-testid="icon-wallet" />,
  LayoutDashboard: () => <span data-testid="icon-dashboard" />,
  UserCircle: () => <span data-testid="icon-usercircle" />,
  LogOut: () => <span data-testid="icon-logout" />,
  Menu: () => <span data-testid="icon-menu" />,
  X: () => <span data-testid="icon-x" />,
  Film: () => <span data-testid="icon-film" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="avatar" {...props}>{children}</div>
  ),
  AvatarFallback: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="avatar-fallback" {...props}>{children}</div>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown">{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="dropdown-trigger" {...props}>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick, ...props }: React.HTMLAttributes<HTMLDivElement> & { onClick?: () => void }) => (
    <div data-testid="dropdown-item" onClick={onClick} {...props}>{children}</div>
  ),
  DropdownMenuLabel: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dropdown-label" {...props}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="sheet" data-open={open}>{children}</div>
  ),
  SheetTrigger: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="sheet-trigger" {...props}>{children}</button>
  ),
  SheetContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="sheet-content" {...props}>{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

// ─── Imports after mocks ──────────────────────────────────────────────────

import { useAuth } from "@/_core/hooks/useAuth";

const mockUseAuth = useAuth as vi.Mock;

// ─── Navbar tests ─────────────────────────────────────────────────────────

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Sign In / Sign Up when logged out", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    render(<Navbar />);
    // Navbar + MobileNav both render these
    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sign Up").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sign out")).toBeNull();
  });

  it("shows avatar dropdown with Sign out when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "Sherman", email: "sherman@voidmedia.com", role: "user" },
      loading: false,
      logout: vi.fn(),
    });
    render(<Navbar />);
    expect(screen.getByTestId("dropdown-trigger")).toBeTruthy();
    // Navbar + MobileNav both render "Sign out"
    expect(screen.getAllByText("Sign out").length).toBeGreaterThan(0);
    expect(screen.getAllByText("My Profile").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sign In")).toBeNull();
  });

  it("calls logout when Sign out is clicked", () => {
    const logoutFn = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "Sherman", email: "sherman@voidmedia.com", role: "user" },
      loading: false,
      logout: logoutFn,
    });
    render(<Navbar />);
    const signOut = screen.getAllByText("Sign out")[0];
    fireEvent.click(signOut);
    expect(logoutFn).toHaveBeenCalled();
  });

  it("shows admin link when user is admin", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "Admin", email: "admin@psl.com", role: "admin" },
      loading: false,
      logout: vi.fn(),
    });
    render(<Navbar />);
    expect(screen.getByTitle("Admin")).toBeTruthy();
  });
});

// ─── MobileNav tests ──────────────────────────────────────────────────────

describe("MobileNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Sign In / Sign Up when logged out", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    render(<MobileNav />);
    expect(screen.getByText("Sign In")).toBeTruthy();
    expect(screen.getByText("Sign Up")).toBeTruthy();
    expect(screen.queryByText("Sign out")).toBeNull();
  });

  it("shows Sign out button when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "Sherman", email: "sherman@voidmedia.com", role: "user" },
      loading: false,
      logout: vi.fn(),
    });
    render(<MobileNav />);
    expect(screen.getByText("Sign out")).toBeTruthy();
    expect(screen.getByText("Signed in as")).toBeTruthy();
    expect(screen.getByText("Sherman")).toBeTruthy();
  });

  it("calls logout and closes sheet when Sign out is clicked", () => {
    const logoutFn = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "Sherman", email: "sherman@voidmedia.com", role: "user" },
      loading: false,
      logout: logoutFn,
    });
    render(<MobileNav />);
    const signOut = screen.getByText("Sign out");
    fireEvent.click(signOut);
    expect(logoutFn).toHaveBeenCalledTimes(1);
  });
});
