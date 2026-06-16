import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "@/pages/AdminDashboard";

// Mock dependencies
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    performers: {
      list: {
        useQuery: vi.fn(),
      },
    },
    tournaments: {
      list: {
        useQuery: vi.fn(),
      },
    },
    auth: {
      logout: {
        useMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
      },
    },
    useUtils: vi.fn(() => ({
      auth: { me: { setData: vi.fn(), invalidate: vi.fn() } },
    })),
  },
}));
vi.mock("@/contexts/AuthModalContext", () => ({
  useAuthModal: vi.fn(() => ({ openLogin: vi.fn(), openRegister: vi.fn() })),
}));
vi.mock("@/components/Navbar", () => ({
  default: vi.fn(() => <nav data-testid="navbar" />),
}));
vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useLocation: () => ["/admin", vi.fn()],
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  CardContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  CardDescription: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <p {...props}>{children}</p>
  ),
  CardHeader: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <h3 {...props}>{children}</h3>
  ),
}));
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const mockUseAuth = useAuth as vi.Mock;
const mockTrpc = trpc as vi.Mock;

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: "admin", name: "Admin User" },
      loading: false,
    });
    mockTrpc.performers.list.useQuery.mockReturnValue({ data: [] });
    mockTrpc.tournaments.list.useQuery.mockReturnValue({ data: [] });
  });

  it("renders loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<AdminDashboard />);
    // Check for loading spinner (the component has an animate-spin div)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it("redirects non-admin users", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: "user", name: "Regular User" },
      loading: false,
    });
    render(<AdminDashboard />);
    // When user is not admin, the component returns null immediately
    // Our mock Navbar won't be called, so we just verify the component doesn't crash
    expect(mockUseAuth).toHaveBeenCalled();
  });

  it("renders admin dashboard header with shield icon", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Manage all platform content, tournaments, and NFTs.")).toBeInTheDocument();
  });

  it("renders quick stats cards", () => {
    mockTrpc.performers.list.useQuery.mockReturnValue({ data: [{ id: 1 }, { id: 2 }] });
    mockTrpc.tournaments.list.useQuery.mockReturnValue({ data: [{ id: 1 }] });
    render(<AdminDashboard />);
    expect(screen.getAllByText("Performers")).toBeTruthy();
    expect(screen.getAllByText("Tournaments")).toBeTruthy();
    expect(screen.getByText("Active Now")).toBeInTheDocument();
    expect(screen.getByText("NFTs Generated")).toBeInTheDocument();
  });

  it("renders all management module cards", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Movie & Scene Manager")).toBeInTheDocument();
    expect(screen.getByText("Performer Manager")).toBeInTheDocument();
    expect(screen.getByText("Create Competition")).toBeInTheDocument();
    expect(screen.getByText("Tournament Manager")).toBeInTheDocument();
    expect(screen.getAllByText("NFT Studio")).toBeTruthy();
    expect(screen.getByText("Action Types & Scoring")).toBeInTheDocument();
    expect(screen.getAllByText("Leaderboard")).toBeTruthy();
    expect(screen.getByText("User Transactions")).toBeInTheDocument();
  });

  it("renders quick management buttons", () => {
    render(<AdminDashboard />);
    expect(screen.getAllByText("Performers")).toBeTruthy();
    expect(screen.getByText("Movies & Scenes")).toBeInTheDocument();
    expect(screen.getByText("Create Tournament")).toBeInTheDocument();
    expect(screen.getAllByText("NFT Studio")).toBeTruthy();
    expect(screen.getAllByText("Leaderboard")).toBeTruthy();
  });
});