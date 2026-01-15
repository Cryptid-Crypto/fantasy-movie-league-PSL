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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ActionsManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  
  const utils = trpc.useUtils();
  const { data: actions, isLoading } = trpc.admin.actions.list.useQuery();
  
  const createMutation = trpc.admin.actions.create.useMutation({
    onSuccess: () => {
      utils.admin.actions.list.invalidate();
      setIsCreateOpen(false);
      toast.success("Action created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.admin.actions.update.useMutation({
    onSuccess: () => {
      utils.admin.actions.list.invalidate();
      setEditingAction(null);
      toast.success("Action updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.admin.actions.delete.useMutation({
    onSuccess: () => {
      utils.admin.actions.list.invalidate();
      toast.success("Action deleted successfully");
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
      points: parseInt(formData.get("points") as string),
      description: formData.get("description") as string || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingAction.id,
      name: formData.get("name") as string,
      points: parseInt(formData.get("points") as string),
      description: formData.get("description") as string || undefined,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading actions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {actions?.length || 0} action types defined
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Action
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Action Type</DialogTitle>
                <DialogDescription>
                  Define a new action type with its point value
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Action Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., facial, double penetration"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    name="points"
                    type="number"
                    placeholder="10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe this action..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Action"}
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
              <TableHead>Name</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions?.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                    {action.points} pts
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {action.description || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog
                      open={editingAction?.id === action.id}
                      onOpenChange={(open) => !open && setEditingAction(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAction(action)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleUpdate}>
                          <DialogHeader>
                            <DialogTitle>Edit Action</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Action Name</Label>
                              <Input
                                id="edit-name"
                                name="name"
                                defaultValue={action.name}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-points">Points</Label>
                              <Input
                                id="edit-points"
                                name="points"
                                type="number"
                                defaultValue={action.points}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                name="description"
                                defaultValue={action.description || ""}
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
                        if (confirm(`Delete action "${action.name}"?`)) {
                          deleteMutation.mutate({ id: action.id });
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
            {(!actions || actions.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No actions defined yet. Create your first action type.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
