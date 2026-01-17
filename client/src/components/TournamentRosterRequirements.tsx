import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface TournamentRosterRequirementsProps {
  tournamentId: number;
}

export function TournamentRosterRequirements({ tournamentId }: TournamentRosterRequirementsProps) {
  const { data: requirements, isLoading } = trpc.tournaments.getRosterRequirements.useQuery(
    { tournamentId },
    { enabled: tournamentId > 0 }
  );

  if (isLoading || !requirements || requirements.length === 0) {
    return null;
  }

  // Format requirements into a readable string
  const formatRequirements = () => {
    return requirements.map((req) => {
      const type = req.performerType || "Any Type";
      const count = req.requiredCount;
      return `${count} ${type}${count !== 1 ? 's' : ''}`;
    }).join(", ");
  };

  return (
    <div className="flex items-start gap-2 text-sm">
      <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs font-medium">Roster Requirements:</span>
        <div className="flex flex-wrap gap-1">
          {requirements.map((req, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {req.requiredCount} {req.performerType || "Any Type"}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
