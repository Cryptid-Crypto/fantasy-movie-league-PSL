import { useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function WalletLoginTab({ onSuccess }: { onSuccess: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const utils = trpc.useUtils();
  const [isSigning, setIsSigning] = useState(false);

  const nonceQuery = trpc.auth.nonce.useQuery(undefined, { enabled: false });
  const verifyMutation = trpc.auth.verify.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Signed in with wallet");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Wallet sign-in failed");
    },
  });

  const handleSignIn = async () => {
    if (!address) return;
    setIsSigning(true);
    try {
      const nonceResult = await nonceQuery.refetch();
      const nonce = nonceResult.data?.nonce;
      if (!nonce) throw new Error("Could not get login nonce");

      const domain = window.location.host;
      const uri = window.location.origin;
      const chainId = 137; // Polygon
      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        address,
        "",
        "Sign in to Porn Star League",
        "",
        `URI: ${uri}`,
        `Version: 1`,
        `Chain ID: ${chainId}`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join("\n");

      const signature = await signMessageAsync({ message });
      await verifyMutation.mutateAsync({ message, signature });
    } catch (err) {
      if (err instanceof Error && /rejected|denied/i.test(err.message)) {
        toast.error("Signature request cancelled");
      } else if (!(err instanceof Error && verifyMutation.isError)) {
        toast.error(err instanceof Error ? err.message : "Wallet sign-in failed");
      }
    } finally {
      setIsSigning(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-3">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            variant="outline"
            className="w-full h-12 gap-3"
            disabled={isConnecting}
            onClick={() => connect({ connector })}
          >
            <Wallet className="h-5 w-5 text-primary" />
            {connector.name}
          </Button>
        ))}
        <p className="text-xs text-muted-foreground text-center">
          Connect a Polygon-compatible wallet (MetaMask, WalletConnect, Coinbase Wallet…)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">Connected wallet</p>
        <p className="font-mono text-sm font-medium">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </p>
      </div>
      <Button
        className="w-full h-12 gap-2"
        onClick={handleSignIn}
        disabled={isSigning || verifyMutation.isPending}
      >
        {(isSigning || verifyMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign In with Wallet
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        You'll be asked to sign a message to prove wallet ownership. No gas fees.
      </p>
    </div>
  );
}

function EmailLoginTab({ onSuccess }: { onSuccess: () => void }) {
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");

  const requestMutation = trpc.auth.requestEmailCode.useMutation({
    onSuccess: (data) => {
      setStep("code");
      if (data.delivered === "console") {
        toast.info("Dev mode: login code printed to server console");
      } else {
        toast.success("Login code sent — check your inbox");
      }
    },
    onError: (err) => toast.error(err.message || "Failed to send code"),
  });

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Signed in");
      onSuccess();
    },
    onError: (err) => toast.error(err.message || "Invalid code"),
  });

  if (step === "code") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-code">6-digit code sent to {email}</Label>
          <Input
            id="login-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-2xl tracking-[0.5em] font-mono"
          />
        </div>
        <Button
          className="w-full h-12 gap-2"
          disabled={code.length !== 6 || verifyMutation.isPending}
          onClick={() => verifyMutation.mutate({ email, code })}
        >
          {verifyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify & Sign In
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-0"
            onClick={() => {
              setStep("email");
              setCode("");
            }}
          >
            <ArrowLeft className="h-3 w-3" /> Use a different email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-0"
            disabled={requestMutation.isPending}
            onClick={() => requestMutation.mutate({ email })}
          >
            Resend code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (email) requestMutation.mutate({ email });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full h-12 gap-2" disabled={!email || requestMutation.isPending}>
        {requestMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        Send Login Code
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        We'll email you a 6-digit code. No password needed.
      </p>
    </form>
  );
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to Porn Star League</DialogTitle>
          <DialogDescription>
            Use your Web3 wallet or your email address.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" /> Wallet
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" /> Email
            </TabsTrigger>
          </TabsList>
          <TabsContent value="wallet" className="pt-4">
            <WalletLoginTab onSuccess={close} />
          </TabsContent>
          <TabsContent value="email" className="pt-4">
            <EmailLoginTab onSuccess={close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/** Standalone button that opens the login dialog — drop-in replacement for
 *  the old `window.location.href = getLoginUrl()` buttons. */
export function LoginButton({
  children = "Sign In",
  ...buttonProps
}: React.ComponentProps<typeof Button> & { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <LoginDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
