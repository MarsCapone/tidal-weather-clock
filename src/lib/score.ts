import { Activity } from '@/lib/types/activity'
import { DataContext } from '@/lib/types/context'

type GetScoreParams = {
  dataContext: DataContext
  activity: Activity
}

type GetScoreResult = {
  value: number
  debug: Record<string, any>
}

export default function getScore({
  dataContext,
  activity,
}: GetScoreParams): GetScoreResult {
  return {
    value: 0,
    debug: {
      dataContext,
      activity,
    },
  }
}
