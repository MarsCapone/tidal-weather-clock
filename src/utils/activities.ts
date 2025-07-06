import { DataContext } from '@/types/data'
import { Activity, ActivitySelection } from '@/types/activities'

export function suggestActivity(
  context: DataContext,
  activities: Activity[],
): ActivitySelection {
  return {
    activity: activities[0],
    matchingConstraints: activities[0].constraints,
    reasoning: activities[0].constraints.map((c) => c.description),
  }
}
