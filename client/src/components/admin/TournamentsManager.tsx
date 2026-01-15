import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trophy, Calculator } from "lucide-react";
import { toast } from "sonner";

export function TournamentsManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: tournaments, isLoading } = trpc.admin.tournaments.list.useQuery();
  
  const createMutation = trpc.admin.tournaments.create.useMutation({
    onSuccess: () => {
      utils.admin.tournaments.list.invalidate();
      setIsCreateOpen(false);
      toast.success("Tournament created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.admin.tournaments.update.useMutation({
    onSuccess: () => {
      utils.admin.tournaments.list.invalidate();
      setEditingTournament(null);
      toast.success("Tournament updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const calculateScoresMutation = trpc.admin.tournaments.calculateScores.useMutation({
    onSuccess: () => {
      toast.success("Scores calculated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      requiredNftContractAddress: formData.get("requiredNftContractAddress") as string || undefined,
      entryFee: formData.get("entryFee") as string || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingTournament.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      requiredNftContractAddress: formData.get("requiredNftContractAddress") as string || undefined,
      entryFee: formData.get("entryFee") as string || undefined,
    });
  };

  const getStatusBadge = (tournament: any) => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    const end = new Date(tournament.endDate);
    
    if (now < start) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (now > end) {
      return <Badge variant="outline">Completed</Badge>;
    } else {
      return <Badge className="bg-accent text-accent-foreground">Active</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tournaments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {tournaments?.length || 0} tournaments created
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Tournament</DialogTitle>
                <DialogDescription>
                  Set up a new tournament with NFT-gated entry
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Summer Championship 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tournament details..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredNftContractAddress">Required NFT Contract (Optional)</Label>
                  <Input
                    id="requiredNftContractAddress"
                    name="requiredNftContractAddress"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to allow any performer NFT
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee (MATIC, Optional)</Label>
                  <Input
                    id="entryFee"
                    name="entryFee"
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Tournament"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments?.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{tournament.name}</p>
                      {tournament.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {tournament.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="space-y-1">
                    <p>{new Date(tournament.startDate).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">
                      to {new Date(tournament.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(tournament)}</TableCell>
                <TableCell>
                  {tournament.entryFee && parseFloat(tournament.entryFee) > 0
                    ? `${tournament.entryFee} MATIC`
                    : "Free"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        calculateScoresMutation.mutate({ tournamentId: tournament.id });
                      }}
                      disabled={calculateScoresMutation.isPending}
                      title="Recalculate scores"
                    >
                      <Calculator className="h-4 w-4" />
                    </Button>
                    <Dialog
                      open={editingTournament?.id === tournament.id}
                      onOpenChange={(open) => !open && setEditingTournament(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTournament(tournament)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <form onSubmit={handleUpdate}>
                          <DialogHeader>
                            <DialogTitle>Edit Tournament</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Tournament Name</Label>
                              <Input
                                id="edit-name"
                                name="name"
                                defaultValue={tournament.name}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                name="description"
                                defaultValue={tournament.description || ""}
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-startDate">Start Date</Label>
                                <Input
                                  id="edit-startDate"
                                  name="startDate"
                                  type="datetime-local"
                                  defaultValue={new Date(tournament.startDate).toISOString().slice(0, 16)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-endDate">End Date</Label>
                                <Input
                                  id="edit-endDate"
                                  name="endDate"
                                  type="datetime-local"
                                  defaultValue={new Date(tournament.endDate).toISOString().slice(0, 16)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-requiredNftContractAddress">Required NFT Contract</Label>
                              <Input
                                id="edit-requiredNftContractAddress"
                                name="requiredNftContractAddress"
                                defaultValue={tournament.requiredNftContractAddress || ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-entryFee">Entry Fee (MATIC)</Label>
                              <Input
                                id="edit-entryFee"
                                name="entryFee"
                                defaultValue={tournament.entryFee || ""}
                                step="0.001"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!tournaments || tournaments.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No tournaments yet. Create your first tournament.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
