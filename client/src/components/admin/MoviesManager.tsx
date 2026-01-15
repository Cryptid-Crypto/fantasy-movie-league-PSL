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
import { Plus, Pencil, Trash2, Film, Eye, User } from "lucide-react";
import { toast } from "sonner";
import { SceneManager } from "./SceneManager";
import { MoviePerformersManager } from "./MoviePerformersManager";

export function MoviesManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'performers' | 'scenes' | null>(null);
  
  const utils = trpc.useUtils();
  const { data: movies, isLoading } = trpc.admin.movies.list.useQuery();
  
  const createMutation = trpc.admin.movies.create.useMutation({
    onSuccess: () => {
      utils.admin.movies.list.invalidate();
      setIsCreateOpen(false);
      toast.success("Movie created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.admin.movies.update.useMutation({
    onSuccess: () => {
      utils.admin.movies.list.invalidate();
      setEditingMovie(null);
      toast.success("Movie updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.admin.movies.delete.useMutation({
    onSuccess: () => {
      utils.admin.movies.list.invalidate();
      toast.success("Movie deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const releaseDateStr = formData.get("releaseDate") as string;
    createMutation.mutate({
      title: formData.get("title") as string,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      coverImageUrl: formData.get("coverImageUrl") as string || undefined,
      description: formData.get("description") as string || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const releaseDateStr = formData.get("releaseDate") as string;
    updateMutation.mutate({
      id: editingMovie.id,
      title: formData.get("title") as string,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      coverImageUrl: formData.get("coverImageUrl") as string || undefined,
      description: formData.get("description") as string || undefined,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading movies...</div>;
  }

  if (selectedMovieId && viewMode === 'performers') {
    const movie = movies?.find(m => m.id === selectedMovieId);
    return (
      <MoviePerformersManager
        movieId={selectedMovieId}
        movieTitle={movie?.title || 'Movie'}
        onBack={() => {
          setSelectedMovieId(null);
          setViewMode(null);
        }}
      />
    );
  }

  if (selectedMovieId && viewMode === 'scenes') {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedMovieId(null);
            setViewMode(null);
          }}
          className="mb-4"
        >
          ← Back to Movies
        </Button>
        <SceneManager movieId={selectedMovieId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {movies?.length || 0} movies in database
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Movie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Movie</DialogTitle>
                <DialogDescription>
                  Create a new movie entry
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Movie Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter movie title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                  <Input
                    id="coverImageUrl"
                    name="coverImageUrl"
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Movie description..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Movie"}
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
              <TableHead>Title</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movies?.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {movie.coverImageUrl ? (
                      <img
                        src={movie.coverImageUrl}
                        alt={movie.title}
                        className="w-12 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-16 rounded bg-muted flex items-center justify-center">
                        <Film className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium">{movie.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {movie.releaseDate
                    ? new Date(movie.releaseDate).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {movie.description || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMovieId(movie.id);
                        setViewMode('performers');
                      }}
                      title="Manage performers"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Performers
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMovieId(movie.id);
                        setViewMode('scenes');
                      }}
                      title="Manage scenes"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Scenes
                    </Button>
                    <Dialog
                      open={editingMovie?.id === movie.id}
                      onOpenChange={(open) => !open && setEditingMovie(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingMovie(movie)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <form onSubmit={handleUpdate}>
                          <DialogHeader>
                            <DialogTitle>Edit Movie</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">Movie Title</Label>
                              <Input
                                id="edit-title"
                                name="title"
                                defaultValue={movie.title}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-releaseDate">Release Date</Label>
                              <Input
                                id="edit-releaseDate"
                                name="releaseDate"
                                type="date"
                                defaultValue={
                                  movie.releaseDate
                                    ? new Date(movie.releaseDate).toISOString().split("T")[0]
                                    : ""
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-coverImageUrl">Cover Image URL</Label>
                              <Input
                                id="edit-coverImageUrl"
                                name="coverImageUrl"
                                type="url"
                                defaultValue={movie.coverImageUrl || ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                name="description"
                                defaultValue={movie.description || ""}
                                rows={4}
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
                        if (confirm(`Delete movie "${movie.title}"?`)) {
                          deleteMutation.mutate({ id: movie.id });
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
            {(!movies || movies.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No movies yet. Add your first movie.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
