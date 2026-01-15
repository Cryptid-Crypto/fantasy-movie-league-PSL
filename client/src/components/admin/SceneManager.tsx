import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Clapperboard } from "lucide-react";
import { toast } from "sonner";

export function SceneManager({ movieId }: { movieId: number }) {
  const [isCreateSceneOpen, setIsCreateSceneOpen] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [isLogActionOpen, setIsLogActionOpen] = useState(false);
  
  const utils = trpc.useUtils();
  const { data: movie } = trpc.admin.movies.getById.useQuery({ id: movieId });
  const { data: scenes, isLoading: scenesLoading } = trpc.admin.scenes.listByMovie.useQuery({ movieId });
  const { data: performers } = trpc.admin.movies.getPerformers.useQuery({ movieId });
  const { data: actions } = trpc.admin.actions.list.useQuery();
  const { data: sceneActions } = trpc.admin.sceneActions.list.useQuery(
    { sceneId: selectedSceneId! },
    { enabled: !!selectedSceneId }
  );
  
  const createSceneMutation = trpc.admin.scenes.create.useMutation({
    onSuccess: () => {
      utils.admin.scenes.listByMovie.invalidate({ movieId });
      setIsCreateSceneOpen(false);
      toast.success("Scene created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteSceneMutation = trpc.admin.scenes.delete.useMutation({
    onSuccess: () => {
      utils.admin.scenes.listByMovie.invalidate({ movieId });
      toast.success("Scene deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const logActionMutation = trpc.admin.sceneActions.log.useMutation({
    onSuccess: () => {
      utils.admin.sceneActions.list.invalidate({ sceneId: selectedSceneId! });
      setIsLogActionOpen(false);
      toast.success("Action logged successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteActionMutation = trpc.admin.sceneActions.delete.useMutation({
    onSuccess: () => {
      utils.admin.sceneActions.list.invalidate({ sceneId: selectedSceneId! });
      toast.success("Action removed successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateScene = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createSceneMutation.mutate({
      movieId,
      title: formData.get("title") as string || undefined,
      sceneNumber: parseInt(formData.get("sceneNumber") as string) || undefined,
      duration: parseInt(formData.get("duration") as string) || undefined,
    });
  };

  const handleLogAction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    logActionMutation.mutate({
      sceneId: selectedSceneId!,
      performerId: parseInt(formData.get("performerId") as string),
      actionId: parseInt(formData.get("actionId") as string),
    });
  };

  if (scenesLoading) {
    return <div className="text-center py-8">Loading scenes...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{movie?.title}</CardTitle>
          <CardDescription>Manage scenes and performer actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {scenes?.length || 0} scenes
            </p>
            <Dialog open={isCreateSceneOpen} onOpenChange={setIsCreateSceneOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Scene
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateScene}>
                  <DialogHeader>
                    <DialogTitle>Add Scene</DialogTitle>
                    <DialogDescription>
                      Create a new scene for this movie
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Scene Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Opening scene"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sceneNumber">Scene Number</Label>
                      <Input
                        id="sceneNumber"
                        name="sceneNumber"
                        type="number"
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        placeholder="600"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createSceneMutation.isPending}>
                      {createSceneMutation.isPending ? "Creating..." : "Create Scene"}
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
                  <TableHead>Scene #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions Logged</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenes?.map((scene) => (
                  <TableRow key={scene.id}>
                    <TableCell className="font-medium">
                      {scene.sceneNumber || "—"}
                    </TableCell>
                    <TableCell>{scene.title || "Untitled Scene"}</TableCell>
                    <TableCell>
                      {scene.duration ? `${Math.floor(scene.duration / 60)}:${String(scene.duration % 60).padStart(2, '0')}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setSelectedSceneId(scene.id)}
                        className="p-0 h-auto"
                      >
                        View Actions
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Delete scene ${scene.sceneNumber || scene.id}?`)) {
                            deleteSceneMutation.mutate({ id: scene.id });
                          }
                        }}
                        disabled={deleteSceneMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!scenes || scenes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No scenes yet. Add your first scene.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedSceneId && (
        <Card>
          <CardHeader>
            <CardTitle>Scene Actions</CardTitle>
            <CardDescription>
              Log performer actions for scoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {sceneActions?.length || 0} actions logged
              </p>
              <Dialog open={isLogActionOpen} onOpenChange={setIsLogActionOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Log Action
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleLogAction}>
                    <DialogHeader>
                      <DialogTitle>Log Performer Action</DialogTitle>
                      <DialogDescription>
                        Record an action performed in this scene
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="performerId">Performer</Label>
                        <Select name="performerId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select performer" />
                          </SelectTrigger>
                          <SelectContent>
                            {performers?.map((performer) => (
                              <SelectItem key={performer.id} value={performer.id.toString()}>
                                {performer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="actionId">Action</Label>
                        <Select name="actionId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            {actions?.map((action) => (
                              <SelectItem key={action.id} value={action.id.toString()}>
                                {action.name} ({action.points} pts)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={logActionMutation.isPending}>
                        {logActionMutation.isPending ? "Logging..." : "Log Action"}
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
                    <TableHead>Action</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sceneActions?.map((sceneAction) => (
                    <TableRow key={sceneAction.id}>
                      <TableCell className="font-medium">
                        {sceneAction.performerName}
                      </TableCell>
                      <TableCell>{sceneAction.actionName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                          {sceneAction.actionPoints} pts
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Remove this action log?")) {
                              deleteActionMutation.mutate({ id: sceneAction.id });
                            }
                          }}
                          disabled={deleteActionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!sceneActions || sceneActions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No actions logged yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
