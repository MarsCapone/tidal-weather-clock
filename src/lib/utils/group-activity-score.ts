import { ActivityScore } from '@/lib/db/helpers/activity'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import { addHours, formatISO } from 'date-fns'

export type ActivityScoreWithInterval = ActivityScore & {
  interval: {
    startTimestamp: string
    endTimestamp: string
  }
}

export function groupActivityScores(
  activityScores: ActivityScore[],
): ActivityScoreWithInterval[] {
  const grouped = activityScores.reduce(
    (acc, score) => {
      // acc is the groups so far by the following key
      const key = `${score.activityId}-${score.activityVersion}`

      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(score)
      return acc
    },
    {} as Record<string, ActivityScore[]>,
  )

  // then transform each group into a score with interval
  return Object.values(grouped).map((group) => {
    const sortedByTime = group.sort(
      (a, b) =>
        utcDateStringToUtc(a.timestamp).getTime() -
        utcDateStringToUtc(b.timestamp).getTime(),
    )

    const startTimestamp = sortedByTime[0].timestamp
    const endTimestamp = formatISO(
      addHours(utcDateStringToUtc(sortedByTime.at(-1)!.timestamp), 1),
      dateOptions,
    )

    // use the first one as the base
    const base = sortedByTime[0]

    return {
      ...base,
      interval: {
        startTimestamp,
        endTimestamp,
      },
    }
  })
}
