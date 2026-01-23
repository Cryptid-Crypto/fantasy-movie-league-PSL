import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Award, RefreshCw, Flag } from "lucide-react";
import { toast } from "sonner";

interface BadgeManagerProps {
  performerId: number;
  performerName: string;
  currentBadges?: Array<{ id: number; name: string }>;
  onClose: () => void;
}

export function BadgeManager({ performerId, performerName, currentBadges = [], onClose }: BadgeManagerProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: allBadges, isLoading: badgesLoading } = trpc.admin.badges.list.useQuery();
  const { data: performerBadges, isLoading: performerBadgesLoading } = trpc.admin.performers.getBadges.useQuery({ performerId });
  
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<number[]>([]);
  
  // Update selectedBadgeIds when performerBadges loads
  useEffect(() => {
    if (performerBadges) {
      setSelectedBadgeIds(performerBadges.map((b: any) => b.id));
    }
  }, [performerBadges]);
  
  // Define country list for dropdown
  const countries = ['USA', 'UK', 'Colombia', 'Brazil', 'France', 'Germany', 'Spain', 'Italy', 'Japan', 'Canada', 'Australia', 'Mexico', 'Argentina', 'Russia', 'China', 'India', 'South Korea', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Ukraine', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'New Zealand', 'South Africa', 'Egypt', 'Morocco', 'Kenya', 'Nigeria', 'Ghana'].sort();
  
  // Define country badge names (you can expand this list)
  const countryBadgeNames = countries;
  
  // Filter out country badges from the selection grid (they're in the dropdown)
  const filteredBadges = allBadges?.filter((badge: any) => {
    return !countryBadgeNames.includes(badge.name);
  });
  
  const updateBadgesMutation = trpc.admin.performers.updateBadges.useMutation({
    onSuccess: () => {
      utils.admin.performers.list.invalidate();
      utils.admin.performers.getBadges.invalidate({ performerId });
      toast.success("Badges updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const regenerateCardMutation = trpc.admin.performers.regenerateCard.useMutation({
    onSuccess: () => {
      utils.admin.performers.list.invalidate();
      utils.performers.list.invalidate();
      utils.performers.getById.invalidate({ id: performerId });
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

  if (badgesLoading || performerBadgesLoading) {
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
        {/* Country Selection Dropdown */}
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Label className="mb-2 block font-semibold flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Select Performer Country
          </Label>
          <Select
            value={selectedCountry}
            onValueChange={(country) => {
              setSelectedCountry(country);
              // Find or auto-select country badge
              const countryBadge = allBadges?.find((b: any) => b.name === country);
              if (countryBadge) {
                // Remove any existing country badges
                const nonCountryBadges = selectedBadgeIds.filter(id => {
                  const badge = allBadges?.find((b: any) => b.id === id);
                  return badge && !countryBadgeNames.includes(badge.name);
                });
                // Add the new country badge
                setSelectedBadgeIds([...nonCountryBadges, countryBadge.id]);
                toast.success(`${country} badge selected`);
              } else {
                toast.info(`${country} badge not found in database. Please create it first.`);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Selecting a country will automatically assign the country badge (if it exists in the database)
          </p>
        </div>



        <div className="grid grid-cols-2 gap-4">
          {filteredBadges?.map((badge: any) => {
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
                          <div className="w-12 h-12 flex items-center justify-center">
                            <img
                              src={`${badge.iconUrl}?v=5`}
                              alt={badge.name}
                              className="w-10 h-10 object-contain"
                            />
                          </div>
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
