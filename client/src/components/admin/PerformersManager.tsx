import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, User } from "lucide-react";
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
] as const;

type PerformerType = "Legend" | "Anal Queen" | "Super Slut" | "Extreme" | "Girl Next Door" | "Rising Star" | "Hall of Fame" | "Specialist";

export function PerformersManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPerformer, setEditingPerformer] = useState<any>(null);
  const [performerType, setPerformerType] = useState<PerformerType | "">("");
  const [editPerformerType, setEditPerformerType] = useState<PerformerType | "">("");
  
  const utils = trpc.useUtils();
  const { data: performers, isLoading } = trpc.admin.performers.list.useQuery();
  
  const createMutation = trpc.admin.performers.create.useMutation({
    onSuccess: () => {
      utils.admin.performers.list.invalidate();
      setIsCreateOpen(false);
      toast.success("Performer created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.admin.performers.update.useMutation({
    onSuccess: () => {
      utils.admin.performers.list.invalidate();
      setEditingPerformer(null);
      toast.success("Performer updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.admin.performers.delete.useMutation({
    onSuccess: () => {
      utils.admin.performers.list.invalidate();
      toast.success("Performer deleted successfully");
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
      bio: formData.get("bio") as string || undefined,
      imageUrl: formData.get("imageUrl") as string || undefined,
      nftContractAddress: formData.get("nftContractAddress") as string || undefined,
      performerType: performerType || undefined as PerformerType | undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingPerformer.id,
      name: formData.get("name") as string,
      bio: formData.get("bio") as string || undefined,
      imageUrl: formData.get("imageUrl") as string || undefined,
      nftContractAddress: formData.get("nftContractAddress") as string || undefined,
      performerType: editPerformerType || undefined as PerformerType | undefined,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading performers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {performers?.length || 0} performers registered
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Performer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Performer</DialogTitle>
                <DialogDescription>
                  Create a new performer profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Performer Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter performer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Short biography..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performerType">Performer Type</Label>
                  <Select value={performerType} onValueChange={(value) => setPerformerType(value as PerformerType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERFORMER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nftContractAddress">NFT Contract Address (Polygon)</Label>
                  <Input
                    id="nftContractAddress"
                    name="nftContractAddress"
                    placeholder="0x..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Performer"}
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
              <TableHead>Performer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>NFT Contract</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performers?.map((performer) => (
              <TableRow key={performer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {performer.imageUrl ? (
                      <img
                        src={performer.imageUrl}
                        alt={performer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium">{performer.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {performer.performerType ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {performer.performerType}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {performer.nftContractAddress ? (
                    <span className="text-accent">
                      {performer.nftContractAddress.slice(0, 6)}...
                      {performer.nftContractAddress.slice(-4)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {performer.bio || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog
                      open={editingPerformer?.id === performer.id}
                      onOpenChange={(open) => !open && setEditingPerformer(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingPerformer(performer);
                            setEditPerformerType(performer.performerType || "");
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <form onSubmit={handleUpdate}>
                          <DialogHeader>
                            <DialogTitle>Edit Performer</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Performer Name</Label>
                              <Input
                                id="edit-name"
                                name="name"
                                defaultValue={performer.name}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-bio">Bio</Label>
                              <Textarea
                                id="edit-bio"
                                name="bio"
                                defaultValue={performer.bio || ""}
                                rows={4}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-imageUrl">Image URL</Label>
                              <Input
                                id="edit-imageUrl"
                                name="imageUrl"
                                type="url"
                                defaultValue={performer.imageUrl || ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-performerType">Performer Type</Label>
                              <Select value={editPerformerType} onValueChange={(value) => setEditPerformerType(value as PerformerType)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PERFORMER_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-nftContractAddress">NFT Contract Address</Label>
                              <Input
                                id="edit-nftContractAddress"
                                name="nftContractAddress"
                                defaultValue={performer.nftContractAddress || ""}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete performer "${performer.name}"?`)) {
                          deleteMutation.mutate({ id: performer.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!performers || performers.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No performers yet. Add your first performer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
