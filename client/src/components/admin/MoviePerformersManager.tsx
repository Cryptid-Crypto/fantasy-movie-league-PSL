import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface MoviePerformersManagerProps {
  movieId: number;
  movieTitle: string;
  onBack: () => void;
}

export function MoviePerformersManager({ movieId, movieTitle, onBack }: MoviePerformersManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPerformerId, setSelectedPerformerId] = useState<string>("");
  
  const utils = trpc.useUtils();
  const { data: moviePerformers, isLoading: performersLoading } = trpc.admin.movies.getPerformers.useQuery({ movieId });
  const { data: allPerformers } = trpc.admin.performers.list.useQuery();
  
  const addPerformerMutation = trpc.admin.movies.addPerformer.useMutation({
    onSuccess: () => {
      utils.admin.movies.getPerformers.invalidate({ movieId });
      setIsAddOpen(false);
      setSelectedPerformerId("");
      toast.success("Performer added to movie");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const removePerformerMutation = trpc.admin.movies.removePerformer.useMutation({
    onSuccess: () => {
      utils.admin.movies.getPerformers.invalidate({ movieId });
      toast.success("Performer removed from movie");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddPerformer = () => {
    if (!selectedPerformerId) {
      toast.error("Please select a performer");
      return;
    }
    addPerformerMutation.mutate({
      movieId,
      performerId: parseInt(selectedPerformerId),
    });
  };

  // Filter out performers already in the movie
  const availablePerformers = allPerformers?.filter(
    (p) => !moviePerformers?.some((mp) => mp.id === p.id)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Movies
          </Button>
          <h2 className="text-2xl font-bold">{movieTitle}</h2>
          <p className="text-muted-foreground">Manage performers in this movie</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Performer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Performer to Movie</DialogTitle>
              <DialogDescription>
                Select a performer to add to this movie
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="performer">Performer</Label>
                <Select value={selectedPerformerId} onValueChange={setSelectedPerformerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a performer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePerformers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        All performers already added
                      </div>
                    ) : (
                      availablePerformers.map((performer) => (
                        <SelectItem key={performer.id} value={performer.id.toString()}>
                          {performer.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleAddPerformer}
                disabled={addPerformerMutation.isPending || !selectedPerformerId}
              >
                {addPerformerMutation.isPending ? "Adding..." : "Add Performer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {performersLoading ? (
        <div className="text-center py-8">Loading performers...</div>
      ) : moviePerformers && moviePerformers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moviePerformers.map((performer) => (
            <Card key={performer.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {performer.imageUrl ? (
                      <img
                        src={performer.imageUrl}
                        alt={performer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{performer.name}</CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Remove ${performer.name} from this movie?`)) {
                        removePerformerMutation.mutate({
                          movieId,
                          performerId: performer.id,
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {performer.bio && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {performer.bio}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No performers added to this movie yet</p>
            <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
              Add First Performer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
