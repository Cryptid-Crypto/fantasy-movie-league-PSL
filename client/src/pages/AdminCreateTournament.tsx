import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Shield, Trophy, ArrowLeft, Plus, Trash2, Save, Eye } from "lucide-react";
import { toast } from "sonner";

const PERFORMER_TYPES = ["Any Type", "Legend", "Hall of Fame", "Rising Star", "Anal Queen", "Super Slut", "Girl Next Door", "MILF", "Squirt Queen"];

type RosterRequirement = {
  performerType: string;
  count: number;
};

export default function AdminCreateTournament() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    entryFee: "",
    prizePool: "",
    maxEntries: "",
    status: "draft" as "draft" | "active" | "upcoming",
  });

  const [rosterRequirements, setRosterRequirements] = useState<RosterRequirement[]>([
    { performerType: "Any Type", count: 5 },
  ]);

  const createTournament = trpc.admin.tournaments.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("Tournament created successfully!");
      setLocation(`/tournaments/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(`Failed to create tournament: ${err.message}`);
    },
  });

  const addRequirement = () => {
    setRosterRequirements([...rosterRequirements, { performerType: "Any Type", count: 1 }]);
  };

  const removeRequirement = (idx: number) => {
    setRosterRequirements(rosterRequirements.filter((_, i) => i !== idx));
  };

  const updateRequirement = (idx: number, field: keyof RosterRequirement, value: string | number) => {
    const updated = [...rosterRequirements];
    updated[idx] = { ...updated[idx], [field]: value };
    setRosterRequirements(updated);
  };

  const totalRosterSize = rosterRequirements.reduce((sum, r) => sum + r.count, 0);

  const handleSubmit = (status: "draft" | "active" | "upcoming") => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createTournament.mutate({
      name: form.name,
      description: form.description,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      entryFee: form.entryFee || undefined,
      rosterRequirements: rosterRequirements.map(r => ({
        performerType: r.performerType === "Any Type" ? null : r.performerType,
        requiredCount: r.count,
      })),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">This page is only accessible to platform administrators.</p>
            {!user ? (
              <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
            ) : (
              <Link href="/"><Button variant="outline">Back to Home</Button></Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <ArrowLeft className="h-3 w-3" />
              Admin Dashboard
            </Button>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Create Competition</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Trophy className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold">Create Competition</h1>
              <Badge variant="outline" className="text-primary border-primary">Admin</Badge>
            </div>
            <p className="text-muted-foreground">
              Set up a new tournament — define rules, roster requirements, entry fees, and prize pool.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Tournament Details</CardTitle>
                <CardDescription>Basic information about the competition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="e.g. PSL Weekly Championship — Week 1"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the tournament, special rules, or featured performers..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date <span className="text-destructive">*</span></Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card>
              <CardHeader>
                <CardTitle>Entry Fee & Prize Pool</CardTitle>
                <CardDescription>Set the cost to enter and the prize distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee (MATIC)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.entryFee}
                      onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Set to 0 for free entry</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizePool">Prize Pool (MATIC)</Label>
                    <Input
                      id="prizePool"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.prizePool}
                      onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxEntries">Max Entries</Label>
                    <Input
                      id="maxEntries"
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={form.maxEntries}
                      onChange={(e) => setForm({ ...form, maxEntries: e.target.value })}
                    />
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-2">Default Prize Distribution</p>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between"><span>🥇 1st Place</span><span>50%</span></div>
                    <div className="flex justify-between"><span>🥈 2nd Place</span><span>30%</span></div>
                    <div className="flex justify-between"><span>🥉 3rd Place</span><span>20%</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roster Requirements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Roster Requirements</CardTitle>
                    <CardDescription>Define what performer types players must include in their roster</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={addRequirement}>
                    <Plus className="h-4 w-4" />
                    Add Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {rosterRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Select
                      value={req.performerType}
                      onValueChange={(v) => updateRequirement(idx, "performerType", v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERFORMER_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground whitespace-nowrap">×</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        className="w-16 text-center"
                        value={req.count}
                        onChange={(e) => updateRequirement(idx, "count", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    {rosterRequirements.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => removeRequirement(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Total roster size: <span className="font-semibold text-foreground">{totalRosterSize} performers</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — Preview & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How this tournament will appear to players</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                  <div className="flex items-start gap-3">
                    <Trophy className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{form.name || "Tournament Name"}</p>
                      {form.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-background rounded p-2">
                      <p className="text-muted-foreground">Entry Fee</p>
                      <p className="font-semibold">{form.entryFee ? `${form.entryFee} MATIC` : "Free"}</p>
                    </div>
                    <div className="bg-background rounded p-2">
                      <p className="text-muted-foreground">Prize Pool</p>
                      <p className="font-semibold">{form.prizePool ? `${form.prizePool} MATIC` : "—"}</p>
                    </div>
                    <div className="bg-background rounded p-2">
                      <p className="text-muted-foreground">Roster Size</p>
                      <p className="font-semibold">{totalRosterSize} performers</p>
                    </div>
                    <div className="bg-background rounded p-2">
                      <p className="text-muted-foreground">Max Entries</p>
                      <p className="font-semibold">{form.maxEntries || "Unlimited"}</p>
                    </div>
                  </div>
                  {rosterRequirements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Roster Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {rosterRequirements.map((r, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {r.count}× {r.performerType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full gap-2"
                  disabled={createTournament.isPending}
                  onClick={() => handleSubmit("upcoming")}
                >
                  <Eye className="h-4 w-4" />
                  Publish as Upcoming
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={createTournament.isPending}
                  onClick={() => handleSubmit("active")}
                >
                  <Trophy className="h-4 w-4" />
                  Publish as Active
                </Button>
                <Button
                  variant="ghost"
                  className="w-full gap-2"
                  disabled={createTournament.isPending}
                  onClick={() => handleSubmit("draft")}
                >
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
                <Link href="/admin">
                  <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
