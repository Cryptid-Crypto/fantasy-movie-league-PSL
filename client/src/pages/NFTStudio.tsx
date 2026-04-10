import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Sparkles, Shield, RefreshCw, Search, Star,
  Plus, Send, Coins, Package, Trophy
} from "lucide-react";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  Rare: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Epic: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Legendary: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
};

export default function NFTStudio() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [mintDialog, setMintDialog] = useState<{ open: boolean; performer?: any }>({ open: false });
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; card?: any }>({ open: false });
  const [grantDialog, setGrantDialog] = useState(false);
  const [mintRarity, setMintRarity] = useState<"Common" | "Rare" | "Epic" | "Legendary">("Common");
  const [mintCount, setMintCount] = useState(1);
  const [assignUserId, setAssignUserId] = useState("");
  const [grantUserId, setGrantUserId] = useState("");
  const [grantAmount, setGrantAmount] = useState(100);
  const [grantDesc, setGrantDesc] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: performers, isLoading: performersLoading } = trpc.performers.list.useQuery();
  const { data: allCards, isLoading: cardsLoading } = trpc.nftPlatform.getAllCards.useQuery();
  const { data: treasury } = trpc.nftPlatform.getTreasury.useQuery();

  const mintMutation = trpc.nftPlatform.mint.useMutation({
    onSuccess: (data) => {
      toast.success(`Minted ${data.minted.length} NFT card(s) successfully!`);
      utils.nftPlatform.getAllCards.invalidate();
      utils.nftPlatform.getTreasury.invalidate();
      setMintDialog({ open: false });
    },
    onError: (e) => toast.error(e.message),
  });

  const assignMutation = trpc.nftPlatform.assignToUser.useMutation({
    onSuccess: () => {
      toast.success("Card assigned to user successfully!");
      utils.nftPlatform.getAllCards.invalidate();
      utils.nftPlatform.getTreasury.invalidate();
      setAssignDialog({ open: false });
      setAssignUserId("");
    },
    onError: (e) => toast.error(e.message),
  });

  const grantMutation = trpc.nftPlatform.grantCredits.useMutation({
    onSuccess: () => {
      toast.success(`${grantAmount} PSL credits granted!`);
      setGrantDialog(false);
      setGrantUserId("");
      setGrantAmount(100);
      setGrantDesc("");
    },
    onError: (e) => toast.error(e.message),
  });

  const regenerateMutation = trpc.admin.performers.regenerateCard.useMutation({
    onSuccess: () => {
      toast.success("Card regenerated and uploaded!");
      utils.performers.list.invalidate();
      utils.nftPlatform.getAllCards.invalidate();
      setRegeneratingId(null);
    },
    onError: (e) => {
      toast.error(e.message);
      setRegeneratingId(null);
    },
  });

  const filtered = (performers ?? []).filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">You need admin privileges to access the NFT Studio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                NFT Studio
              </h1>
              <p className="text-muted-foreground mt-1">Mint, manage, and distribute Performer NFT cards</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setGrantDialog(true)}>
                <Coins className="h-4 w-4" />
                Grant Credits
              </Button>
              <Link href="/admin">
                <Button variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{allCards?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Minted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-yellow-400">{treasury?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">In Treasury</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-400">
                  {(allCards ?? []).filter((c: any) => c.ownerId).length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Distributed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-400">{performers?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Performers</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="mint">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mint" className="gap-2">
                <Plus className="h-4 w-4" /> Mint Cards
              </TabsTrigger>
              <TabsTrigger value="treasury" className="gap-2">
                <Package className="h-4 w-4" /> Treasury
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Trophy className="h-4 w-4" /> All Cards
              </TabsTrigger>
            </TabsList>

            {/* MINT TAB */}
            <TabsContent value="mint" className="space-y-6 mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search performers to mint cards for..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {performersLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filtered.map((p: any) => {
                    const cardCount = (allCards ?? []).filter((c: any) => c.performerId === p.id).length;
                    return (
                      <Card key={p.id} className="overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : p.portraitUrl ? (
                            <img src={p.portraitUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <Button
                              size="sm"
                              className="w-full h-8 text-xs gap-1"
                              onClick={() => setMintDialog({ open: true, performer: p })}
                            >
                              <Plus className="h-3 w-3" /> Mint Card
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full h-8 text-xs gap-1"
                              disabled={regeneratingId === p.id}
                              onClick={() => {
                                setRegeneratingId(p.id);
                                regenerateMutation.mutate({ performerId: p.id });
                              }}
                            >
                              {regeneratingId === p.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              Regen Art
                            </Button>
                          </div>
                          {cardCount > 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-primary/90 text-xs">{cardCount} minted</Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-2 space-y-1">
                          <p className="text-xs font-semibold truncate">{p.name}</p>
                          <Badge variant="outline" className="text-xs w-full justify-center">
                            {p.performerType ?? "No Type"}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TREASURY TAB */}
            <TabsContent value="treasury" className="space-y-6 mt-6">
              <p className="text-muted-foreground text-sm">
                {treasury?.length ?? 0} unassigned cards in treasury — assign them to players
              </p>
              {!treasury || treasury.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                    <p className="text-xl text-muted-foreground">Treasury is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Mint cards in the Mint tab to populate the treasury</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {treasury.map((card: any) => (
                    <Card key={card.id} className="overflow-hidden group">
                      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                        {card.cardImageUrl ? (
                          <img src={card.cardImageUrl} alt={card.performerName} className="w-full h-full object-cover" />
                        ) : card.performerImageUrl ? (
                          <img src={card.performerImageUrl} alt={card.performerName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => setAssignDialog({ open: true, card })}
                          >
                            <Send className="h-3 w-3" /> Assign
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className={`text-xs ${RARITY_COLORS[card.rarity]}`}>{card.rarity}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-2 space-y-1">
                        <p className="text-xs font-semibold truncate">{card.performerName}</p>
                        <p className="text-xs text-muted-foreground">#{card.serialNumber}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ALL CARDS TAB */}
            <TabsContent value="all" className="space-y-6 mt-6">
              {cardsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                </div>
              ) : !allCards || allCards.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                    <p className="text-xl text-muted-foreground">No cards minted yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-4">Card</th>
                        <th className="text-left py-3 px-4">Performer</th>
                        <th className="text-left py-3 px-4">Serial</th>
                        <th className="text-left py-3 px-4">Rarity</th>
                        <th className="text-left py-3 px-4">Owner</th>
                        <th className="text-left py-3 px-4">Minted</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCards.map((card: any) => (
                        <tr key={card.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="w-10 h-14 rounded overflow-hidden bg-muted">
                              {(card.cardImageUrl || card.performerImageUrl) && (
                                <img src={card.cardImageUrl ?? card.performerImageUrl} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{card.performerName}</td>
                          <td className="py-3 px-4 text-muted-foreground">#{card.serialNumber}</td>
                          <td className="py-3 px-4">
                            <Badge className={`text-xs ${RARITY_COLORS[card.rarity]}`}>{card.rarity}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            {card.ownerName ? (
                              <span className="text-green-400">{card.ownerName}</span>
                            ) : (
                              <span className="text-muted-foreground italic">Treasury</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {new Date(card.mintedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {!card.ownerId && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-xs h-7"
                                onClick={() => setAssignDialog({ open: true, card })}
                              >
                                <Send className="h-3 w-3" /> Assign
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* MINT DIALOG */}
      <Dialog open={mintDialog.open} onOpenChange={(o) => setMintDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint NFT Cards — {mintDialog.performer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Rarity</Label>
              <Select value={mintRarity} onValueChange={(v) => setMintRarity(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Common">Common</SelectItem>
                  <SelectItem value="Rare">Rare</SelectItem>
                  <SelectItem value="Epic">Epic</SelectItem>
                  <SelectItem value="Legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Cards to Mint</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={mintCount}
                onChange={(e) => setMintCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              />
              <p className="text-xs text-muted-foreground">Each card gets a unique serial number. Cards go to treasury until assigned.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMintDialog({ open: false })}>Cancel</Button>
            <Button
              disabled={mintMutation.isPending}
              onClick={() => {
                if (!mintDialog.performer) return;
                mintMutation.mutate({ performerId: mintDialog.performer.id, rarity: mintRarity, count: mintCount });
              }}
            >
              {mintMutation.isPending ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Minting...</> : <><Sparkles className="h-4 w-4 mr-2" />Mint {mintCount} Card{mintCount > 1 ? "s" : ""}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ASSIGN DIALOG */}
      <Dialog open={assignDialog.open} onOpenChange={(o) => setAssignDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Card to Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {assignDialog.card && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  {(assignDialog.card.cardImageUrl || assignDialog.card.performerImageUrl) && (
                    <img src={assignDialog.card.cardImageUrl ?? assignDialog.card.performerImageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{assignDialog.card.performerName}</p>
                  <p className="text-sm text-muted-foreground">#{assignDialog.card.serialNumber} · {assignDialog.card.rarity}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Player User ID</Label>
              <Input placeholder="Enter user ID..." value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} />
              <p className="text-xs text-muted-foreground">Find user IDs in the Admin → Users section.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog({ open: false })}>Cancel</Button>
            <Button
              disabled={!assignUserId || assignMutation.isPending}
              onClick={() => {
                if (!assignDialog.card || !assignUserId) return;
                assignMutation.mutate({ cardId: assignDialog.card.id, userId: parseInt(assignUserId) });
              }}
            >
              {assignMutation.isPending ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Assigning...</> : <><Send className="h-4 w-4 mr-2" />Assign Card</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GRANT CREDITS DIALOG */}
      <Dialog open={grantDialog} onOpenChange={setGrantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant PSL Credits to Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Player User ID</Label>
              <Input placeholder="Enter user ID..." value={grantUserId} onChange={(e) => setGrantUserId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount (PSL Credits)</Label>
              <Input type="number" min={1} value={grantAmount} onChange={(e) => setGrantAmount(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input placeholder="e.g. Welcome bonus, Tournament prize..." value={grantDesc} onChange={(e) => setGrantDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantDialog(false)}>Cancel</Button>
            <Button
              disabled={!grantUserId || grantMutation.isPending}
              onClick={() => {
                grantMutation.mutate({ userId: parseInt(grantUserId), amount: grantAmount, description: grantDesc || undefined });
              }}
            >
              {grantMutation.isPending ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Granting...</> : <><Coins className="h-4 w-4 mr-2" />Grant {grantAmount} Credits</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
