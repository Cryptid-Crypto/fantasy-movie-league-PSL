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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, User, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MoviePerformersManagerProps {
  movieId: number;
  movieTitle: string;
  onBack: () => void;
}

export function MoviePerformersManager({ movieId, movieTitle, onBack }: MoviePerformersManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPerformerId, setSelectedPerformerId] = useState<number | null>(null);
  
  // New performer form state
  const [newPerformerName, setNewPerformerName] = useState("");
  const [newPerformerBio, setNewPerformerBio] = useState("");
  const [newPerformerImage, setNewPerformerImage] = useState("");
  
  const utils = trpc.useUtils();
  const { data: moviePerformers, isLoading: performersLoading } = trpc.admin.movies.getPerformers.useQuery({ movieId });
  const { data: allPerformers } = trpc.admin.performers.list.useQuery();
  
  const addPerformerMutation = trpc.admin.movies.addPerformer.useMutation({
    onSuccess: () => {
      utils.admin.movies.getPerformers.invalidate({ movieId });
      setIsAddOpen(false);
      setSelectedPerformerId(null);
      setSearchValue("");
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

  const createPerformerMutation = trpc.admin.performers.create.useMutation({
    onSuccess: (newPerformer) => {
      utils.admin.performers.list.invalidate();
      toast.success("Performer created");
      setIsCreateOpen(false);
      // Auto-select the newly created performer
      setSelectedPerformerId(newPerformer.id);
      setSearchValue(newPerformer.name);
      // Reset form
      setNewPerformerName("");
      setNewPerformerBio("");
      setNewPerformerImage("");
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
      performerId: selectedPerformerId,
    });
  };

  const handleCreatePerformer = () => {
    if (!newPerformerName.trim()) {
      toast.error("Please enter a performer name");
      return;
    }
    createPerformerMutation.mutate({
      name: newPerformerName,
      bio: newPerformerBio || undefined,
      imageUrl: newPerformerImage || undefined,
    });
  };

  // Filter out performers already in the movie
  const availablePerformers = allPerformers?.filter(
    (p) => !moviePerformers?.some((mp) => mp.id === p.id)
  ) || [];

  // Filter performers based on search
  const filteredPerformers = availablePerformers.filter((p) =>
    p.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedPerformer = availablePerformers.find((p) => p.id === selectedPerformerId);

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
                Start typing to search for a performer or create a new one
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Performer</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedPerformer ? selectedPerformer.name : "Select performer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search performers..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="py-6 text-center text-sm">
                            <p className="text-muted-foreground mb-3">No performer found</p>
                            <Button
                              size="sm"
                              onClick={() => {
                                setNewPerformerName(searchValue);
                                setIsCreateOpen(true);
                                setComboboxOpen(false);
                              }}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Create "{searchValue}"
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredPerformers.map((performer) => (
                            <CommandItem
                              key={performer.id}
                              value={performer.name}
                              onSelect={() => {
                                setSelectedPerformerId(performer.id);
                                setSearchValue(performer.name);
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPerformerId === performer.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {performer.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPerformer} disabled={!selectedPerformerId || addPerformerMutation.isPending}>
                {addPerformerMutation.isPending ? "Adding..." : "Add Performer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Create New Performer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Performer</DialogTitle>
            <DialogDescription>
              Add a new performer to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newPerformerName}
                onChange={(e) => setNewPerformerName(e.target.value)}
                placeholder="Enter performer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={newPerformerBio}
                onChange={(e) => setNewPerformerBio(e.target.value)}
                placeholder="Enter performer bio (optional)"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={newPerformerImage}
                onChange={(e) => setNewPerformerImage(e.target.value)}
                placeholder="https://example.com/image.jpg (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePerformer} disabled={createPerformerMutation.isPending}>
              {createPerformerMutation.isPending ? "Creating..." : "Create Performer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performers List */}
      <Card>
        <CardHeader>
          <CardTitle>Performers in this Movie ({moviePerformers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {performersLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : moviePerformers && moviePerformers.length > 0 ? (
            <div className="space-y-2">
              {moviePerformers.map((performer) => (
                <div
                  key={performer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover-lift"
                >
                  <div className="flex items-center gap-3">
                    {performer.imageUrl ? (
                      <img
                        src={performer.imageUrl}
                        alt={performer.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{performer.name}</p>
                      {performer.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{performer.bio}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Remove ${performer.name} from this movie?`)) {
                        removePerformerMutation.mutate({ movieId, performerId: performer.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No performers added yet. Click "Add Performer" to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
