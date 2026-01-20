import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Award, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BadgeManagerProps {
  performerId: number;
  performerName: string;
  currentBadges?: Array<{ id: number; name: string }>;
  onClose: () => void;
}

export function BadgeManager({ performerId, performerName, currentBadges = [], onClose }: BadgeManagerProps) {
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<number[]>(
    currentBadges.map(b => b.id)
  );
  const [isRegenerating, setIsRegenerating] = useState(false);

  const utils = trpc.useUtils();
  const { data: allBadges, isLoading: badgesLoading } = trpc.admin.badges.list.useQuery();
  
  const updateBadgesMutation = trpc.admin.performers.updateBadges.useMutation({
    onSuccess: () => {
      utils.admin.performers.list.invalidate();
      toast.success("Badges updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const regenerateCardMutation = trpc.admin.performers.regenerateCard.useMutation({
    onSuccess: () => {
      utils.admin.performers.list.invalidate();
      setIsRegenerating(false);
      toast.success("NFT card regenerated successfully!");
      onClose();
    },
    onError: (error) => {
      setIsRegenerating(false);
      toast.error(`Failed to regenerate card: ${error.message}`);
    },
  });

  const handleToggleBadge = (badgeId: number) => {
    setSelectedBadgeIds(prev =>
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const handleSaveAndRegenerate = async () => {
    try {
      // First update badges
      await updateBadgesMutation.mutateAsync({
        performerId,
        badgeIds: selectedBadgeIds,
      });

      // Then regenerate card
      setIsRegenerating(true);
      await regenerateCardMutation.mutateAsync({ performerId });
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  if (badgesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Manage Badges for {performerName}
        </DialogTitle>
        <DialogDescription>
          Select badges to display on the NFT card. The card will be automatically regenerated.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <div className="grid grid-cols-2 gap-4">
          {allBadges?.map((badge: any) => {
            const isSelected = selectedBadgeIds.includes(badge.id);
            return (
              <Card
                key={badge.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-primary border-2 bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => handleToggleBadge(badge.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleBadge(badge.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {badge.iconUrl && (
                          <img
                            src={badge.iconUrl}
                            alt={badge.name}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <Label className="font-semibold cursor-pointer">
                          {badge.name}
                        </Label>
                      </div>
                      {badge.description && (
                        <p className="text-xs text-muted-foreground">
                          {badge.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedBadgeIds.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Selected Badges ({selectedBadgeIds.length}):</p>
            <div className="flex flex-wrap gap-2">
              {allBadges
                ?.filter((b: any) => selectedBadgeIds.includes(b.id))
                .map((badge: any) => (
                  <Badge key={badge.id} variant="secondary" className="gap-1">
                    {badge.iconUrl && (
                      <img src={badge.iconUrl} alt="" className="w-4 h-4" />
                    )}
                    {badge.name}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isRegenerating}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveAndRegenerate}
          disabled={updateBadgesMutation.isPending || isRegenerating}
          className="gap-2"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating Card...
            </>
          ) : updateBadgesMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Save & Regenerate Card
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
