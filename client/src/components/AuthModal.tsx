import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Eye, EyeOff, Star, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-green-400" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const utils = trpc.useUtils();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const passwordStrength = getPasswordStrength(regPassword);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setSuccess("Welcome back!");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(null);
        setError(null);
      }, 800);
    },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setSuccess("Account created! Welcome to PSL.");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(null);
        setError(null);
      }, 800);
    },
    onError: (err) => setError(err.message),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email: loginEmail, password: loginPassword, rememberMe });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ageVerified) { setError("You must confirm you are 18 or older."); return; }
    if (!acceptedTerms) { setError("You must accept the terms of service."); return; }
    registerMutation.mutate({
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      ageVerified,
      acceptedTerms,
    });
  };

  const switchTab = (t: "login" | "register") => {
    setTab(t);
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 text-white p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 px-8 pt-8 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Star className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">PORN STAR LEAGUE</span>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                tab === "login"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                tab === "register"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg px-4 py-3 mb-4 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-950 border border-red-800 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-0 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={v => setRememberMe(!!v)}
                    className="border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-black"
                  />
                  <span className="text-zinc-400 text-sm">Remember me</span>
                </label>
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-white text-black hover:bg-zinc-100 font-semibold h-11"
              >
                {loginMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing in...</>
                ) : "Sign In"}
              </Button>
              <p className="text-center text-zinc-500 text-sm">
                Don't have an account?{" "}
                <button type="button" onClick={() => switchTab("register")} className="text-white hover:underline">
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-sm">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-sm">Username</Label>
                  <Input
                    placeholder="coolplayer99"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    required
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-0 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {regPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= passwordStrength.score ? passwordStrength.color : "bg-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500">{passwordStrength.label}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={ageVerified}
                    onCheckedChange={v => setAgeVerified(!!v)}
                    className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-black"
                  />
                  <span className="text-zinc-400 text-sm leading-relaxed">
                    I confirm that I am <span className="text-white font-medium">18 years of age or older</span> and legally permitted to view adult content in my jurisdiction.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={acceptedTerms}
                    onCheckedChange={v => setAcceptedTerms(!!v)}
                    className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-black"
                  />
                  <span className="text-zinc-400 text-sm leading-relaxed">
                    I agree to the{" "}
                    <a href="/rules" className="text-white hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/rules" className="text-white hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-white text-black hover:bg-zinc-100 font-semibold h-11"
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account...</>
                ) : "Create Account"}
              </Button>
              <p className="text-center text-zinc-500 text-sm">
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-white hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
