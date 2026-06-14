/**
 * Calculates the score for a performer in a specific scene based on their actions
 * @param performerId The ID of the performer
 * @param sceneId The ID of the scene
 * @param sceneActions Array of action IDs the performer performed in the scene
 * @param allActions Array of all available actions with their point values
 * @returns Total points scored by the performer in the scene
 */
export function calculateScoreForPerformerInScene(
  performerId: number,
  sceneId: number,
  sceneActions: { actionId: number }[],
  allActions: { id: number; name: string; points: number }[]
): number {
  // Create a map for quick lookup of action points
  const actionPointsMap = new Map<number, number>();
  allActions.forEach(action => {
    actionPointsMap.set(action.id, action.points);
  });

  // Sum up points for all actions in the scene
  let totalPoints = 0;
  for (const sceneAction of sceneActions) {
    const points = actionPointsMap.get(sceneAction.actionId);
    if (points !== undefined) {
      totalPoints += points;
    }
    // Unknown action IDs are ignored (treated as 0 points)
  }

  return totalPoints;
}