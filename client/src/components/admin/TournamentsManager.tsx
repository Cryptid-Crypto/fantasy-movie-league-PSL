import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Plus, Pencil, Trophy, Calculator, X, Users } from "lucide-react";
import { toast } from "sonner";

const PERFORMER_TYPES = [
  "Legend",
  "Anal Queen",
  "Super Slut",
  "Extreme",
  "Girl Next Door",
  "Rising Star",
  "Hall of Fame",
  "Specialist",
];

type RosterRequirement = {
  performerType: string | null; // null means "Any Type"
  requiredCount: number;
};

export function TournamentsManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [rosterRequirements, setRosterRequirements] = useState<RosterRequirement[]>([]);
  
  const utils = trpc.useUtils();
  const { data: tournaments, isLoading } = trpc.admin.tournaments.list.useQuery();
  
  const createMutation = trpc.admin.tournaments.create.useMutation({
    onSuccess: () => {
      utils.admin.tournaments.list.invalidate();
      setIsCreateOpen(false);
      setRosterRequirements([]);
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

  const addRosterRequirement = () => {
    setRosterRequirements([...rosterRequirements, { performerType: null, requiredCount: 1 }]);
  };

  const removeRosterRequirement = (index: number) => {
    setRosterRequirements(rosterRequirements.filter((_, i) => i !== index));
  };

  const updateRosterRequirement = (index: number, field: 'performerType' | 'requiredCount', value: string | number | null) => {
    const updated = [...rosterRequirements];
    if (field === 'performerType') {
      updated[index].performerType = value as string | null;
    } else {
      updated[index].requiredCount = value as number;
    }
    setRosterRequirements(updated);
  };

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
      rosterRequirements: rosterRequirements.length > 0 ? rosterRequirements : undefined,
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
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setRosterRequirements([]);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Tournament</DialogTitle>
                <DialogDescription>
                  Set up a new tournament with roster requirements
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

                {/* Roster Requirements Section */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Roster Requirements</Label>
                      <p className="text-xs text-muted-foreground">
                        Define how many performers of each type users must select to enter
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRosterRequirement}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Add Requirement
                    </Button>
                  </div>

                  {rosterRequirements.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-md">
                      No roster requirements set. Users can enter with any performers.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rosterRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Performer Type</Label>
                              <Select
                                value={req.performerType || "any"}
                                onValueChange={(value) => 
                                  updateRosterRequirement(index, 'performerType', value === "any" ? null : value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="any">Any Type</SelectItem>
                                  {PERFORMER_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Required Count</Label>
                              <Input
                                type="number"
                                min="1"
                                defaultValue={req.requiredCount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val !== '') {
                                    const num = parseInt(val);
                                    if (!isNaN(num) && num >= 1) {
                                      updateRosterRequirement(index, 'requiredCount', num);
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  // Ensure valid number on blur
                                  const val = e.target.value;
                                  if (val === '' || isNaN(parseInt(val)) || parseInt(val) < 1) {
                                    e.target.value = '1';
                                    updateRosterRequirement(index, 'requiredCount', 1);
                                  }
                                }}
                                key={`req-${index}-${req.requiredCount}`}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRosterRequirement(index)}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="text-xs text-muted-foreground pt-2">
                        Total performers required: {rosterRequirements.reduce((sum, req) => sum + req.requiredCount, 0)}
                      </div>
                    </div>
                  )}
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
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments?.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{tournament.name}</div>
                    {tournament.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {tournament.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(tournament.startDate).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">
                      to {new Date(tournament.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(tournament)}</TableCell>
                <TableCell>
                  {tournament.entryFee && parseFloat(tournament.entryFee) > 0
                    ? `${tournament.entryFee} MATIC`
                    : "Free"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => calculateScoresMutation.mutate({ tournamentId: tournament.id })}
                    disabled={calculateScoresMutation.isPending}
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTournament(tournament)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!tournaments || tournaments.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No tournaments created yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingTournament && (
        <Dialog open={!!editingTournament} onOpenChange={() => setEditingTournament(null)}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit Tournament</DialogTitle>
                <DialogDescription>
                  Update tournament details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tournament Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingTournament.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingTournament.description || ""}
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
                      defaultValue={new Date(editingTournament.startDate).toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">End Date</Label>
                    <Input
                      id="edit-endDate"
                      name="endDate"
                      type="datetime-local"
                      defaultValue={new Date(editingTournament.endDate).toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-requiredNftContractAddress">Required NFT Contract</Label>
                  <Input
                    id="edit-requiredNftContractAddress"
                    name="requiredNftContractAddress"
                    defaultValue={editingTournament.requiredNftContractAddress || ""}
                    placeholder="0x..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-entryFee">Entry Fee (MATIC)</Label>
                  <Input
                    id="edit-entryFee"
                    name="entryFee"
                    defaultValue={editingTournament.entryFee || ""}
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Tournament"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
