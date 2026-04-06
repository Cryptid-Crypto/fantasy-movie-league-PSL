import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Trophy, Wallet, Sparkles, Shield, CheckCircle2,
  ArrowRight, Star, Users, Zap
} from "lucide-react";

const steps = [
  { id: 1, title: "Create Account", description: "Set up your player identity" },
  { id: 2, title: "Age Verification", description: "Confirm you are 18+" },
  { id: 3, title: "Connect Wallet", description: "Link your Polygon wallet" },
  { id: 4, title: "Learn the Rules", description: "Quick platform overview" },
];

const features = [
  { icon: Trophy, title: "Compete in Tournaments", description: "Enter weekly and monthly competitions using your Performer NFTs" },
  { icon: Sparkles, title: "Collect NFT Cards", description: "Own unique performer cards with real scene performance data" },
  { icon: Wallet, title: "Earn Rewards", description: "Win MATIC prizes and PSL tokens for top tournament finishes" },
  { icon: Users, title: "Join the Community", description: "Connect with thousands of players on the Polygon network" },
];

export default function Signup() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [ageVerified, setAgeVerified] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });

  // Already logged in — redirect to profile
  if (user) {
    setLocation("/profile");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              <Star className="h-3 w-3 mr-1" />
              Join the League
            </Badge>
            <h1 className="text-4xl font-bold mb-3">Create Your Player Account</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join the first Web3 fantasy tournament platform powered by Porn Star NFTs on Polygon Network.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left — Steps & Features */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Onboarding Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {steps.map((step) => (
                    <div key={step.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${currentStep === step.id ? "bg-primary/10 border border-primary/30" : currentStep > step.id ? "opacity-60" : "opacity-40"}`}>
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep > step.id ? "bg-primary text-primary-foreground" : currentStep === step.id ? "bg-primary/20 text-primary border border-primary" : "bg-muted text-muted-foreground"}`}>
                        {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Why Join PSL?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{title}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right — Sign-up Form */}
            <div className="lg:col-span-3">
              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Your Account</CardTitle>
                    <CardDescription>Set up your player identity on Porn Star League</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* OAuth Sign-in Options */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground text-center">Sign up with</p>
                      <Button
                        variant="outline"
                        className="w-full h-12 gap-3"
                        onClick={() => (window.location.href = getLoginUrl())}
                      >
                        <Zap className="h-5 w-5 text-primary" />
                        Continue with Manus Account
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or fill in details</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Choose a unique username"
                          value={form.username}
                          onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="tos"
                        checked={tosAccepted}
                        onCheckedChange={(v) => setTosAccepted(!!v)}
                      />
                      <Label htmlFor="tos" className="text-sm leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <Link href="/rules">
                          <span className="text-primary underline">Terms of Service</span>
                        </Link>{" "}
                        and{" "}
                        <span className="text-primary underline cursor-pointer">Privacy Policy</span>
                      </Label>
                    </div>

                    <Button
                      className="w-full h-12 gap-2"
                      disabled={!tosAccepted}
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Age Verification */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Age Verification Required
                    </CardTitle>
                    <CardDescription>
                      Porn Star League is an adult platform. You must be 18 years or older to access this site.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-muted/50 border border-border rounded-xl p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Are you 18 or older?</h3>
                        <p className="text-muted-foreground text-sm mt-2">
                          By confirming, you certify that you are at least 18 years of age and legally permitted to access adult content in your jurisdiction.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="age"
                        checked={ageVerified}
                        onCheckedChange={(v) => setAgeVerified(!!v)}
                      />
                      <Label htmlFor="age" className="text-sm leading-relaxed cursor-pointer">
                        I confirm that I am 18 years of age or older and I consent to viewing adult content.
                      </Label>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(1)}>
                        Back
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        disabled={!ageVerified}
                        onClick={() => setCurrentStep(3)}
                      >
                        I Confirm — I'm 18+
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      If you are under 18, please close this page immediately.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Connect Wallet */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Connect Your Wallet
                    </CardTitle>
                    <CardDescription>
                      Link a Polygon-compatible wallet to hold your NFTs and receive tournament prizes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-3">
                      {["MetaMask", "WalletConnect", "Coinbase Wallet", "Trust Wallet"].map((wallet) => (
                        <Button
                          key={wallet}
                          variant="outline"
                          className="w-full h-14 justify-start gap-4 text-base"
                          onClick={() => setCurrentStep(4)}
                        >
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                            <Wallet className="h-4 w-4" />
                          </div>
                          {wallet}
                        </Button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(2)}>
                        Back
                      </Button>
                      <Button variant="ghost" className="flex-1" onClick={() => setCurrentStep(4)}>
                        Skip for now
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      You can connect your wallet later from your profile settings.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Platform Overview */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Welcome to Porn Star League!
                    </CardTitle>
                    <CardDescription>Here's a quick overview of how the platform works.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-4">
                      {[
                        { step: "1", title: "Collect Performer NFTs", desc: "Browse the Marketplace and acquire NFT cards of your favourite performers. Each card has unique stats and rarity." },
                        { step: "2", title: "Enter Tournaments", desc: "Build a roster of performer NFTs and enter weekly or monthly competitions. Entry fees are paid in MATIC." },
                        { step: "3", title: "Earn Points from Scenes", desc: "Your performers earn points based on real scene actions logged by our admin team. Different actions have different point values." },
                        { step: "4", title: "Win Prizes", desc: "Top players on the leaderboard share the prize pool. Winners receive MATIC and PSL token rewards." },
                      ].map(({ step, title, desc }) => (
                        <div key={step} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                            {step}
                          </div>
                          <div>
                            <p className="font-semibold">{title}</p>
                            <p className="text-sm text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(3)}>
                        Back
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => (window.location.href = getLoginUrl())}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Get Started
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
