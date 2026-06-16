import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/web3';
import App from "./App";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import "./index.css";
import "./mobile-touch.css";
import { registerServiceWorker } from "@/lib/registerSW";

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// Register service worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthModalProvider>
          <App />
        </AuthModalProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </WagmiProvider>
);
