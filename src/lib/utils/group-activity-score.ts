import { ActivityScore } from '@/lib/db/helpers/activity'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import { addHours, formatISO } from 'date-fns'

const GROUPING_BRACKETS = {
  maxTimeMs: 60 * 60 * 1000, // 1h
  maxScoreDiff: 0.1,
}

export type ActivityScoreWithInterval = ActivityScore & {
  interval: {
    startTimestamp: string
    endTimestamp: string
  }
}

export function groupActivityScores(
  activityScores: ActivityScore[],
): ActivityScoreWithInterval[] {
  // arrays of scores, where all scores are for the same activity and version,
  // AND within each group the scores are sorted by timestamp
  const sortedGroupedScores = Object.values(
    activityScores.reduce(
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
    ),
  ).map((scores) =>
    scores.sort(
      (a, b) =>
        utcDateStringToUtc(a.timestamp).getTime() -
        utcDateStringToUtc(b.timestamp).getTime(),
    ),
  )

  // and we want to transform this into a list of scores, with intervals spanning the range
  // but we can't just use the earliest and latest timestamps in the group, because we need
  // to confirm there are no gaps in date. otherwise, we need to break those groups into
  // further groups, which can then be converted to the scores with intervals we need.
  // e.g. [1, 2, 3, 6, 7, 8] => [1-3, 6-8]... NOT [1-8]

  const groupedScores = sortedGroupedScores.flatMap((group) => {
    if (group.length === 1) {
      return [group]
    }

    const subGroups = []
    let currentGroup = [group[0]]
    for (let i = 1; i < group.length; i++) {
      const next = group[i]
      // check if next is not within 1 hour of current
      const timeDiff = Math.abs(
        utcDateStringToUtc(next.timestamp).getTime() -
          utcDateStringToUtc(
            currentGroup[currentGroup.length - 1].timestamp,
          ).getTime(),
      )

      // we want to compare the next score to either the current group's min or max score
      const minGroupScore = Math.min(...currentGroup.map((s) => s.score))
      const maxGroupScore = Math.max(...currentGroup.map((s) => s.score))

      if (
        timeDiff <= GROUPING_BRACKETS.maxTimeMs &&
        // if we extend the range of the current group by the appropriate diff, and the next score is within that
        // range, we can consider it still part of the current group
        next.score <= maxGroupScore + GROUPING_BRACKETS.maxScoreDiff &&
        next.score >= minGroupScore - GROUPING_BRACKETS.maxScoreDiff
      ) {
        console.debug('extend group', {
          currentGroup: currentGroup.map((s) => s.score),
          nextScore: next.score,
        })
        // then it's part of the current group
        currentGroup.push(next)
      } else {
        // otherwise, the current group is done and we can start a new one
        console.debug('new group', {
          nextScore: next.score,
          currentGroup: currentGroup.map((s) => s.score),
        })
        subGroups.push(currentGroup)
        currentGroup = [next]
      }
    }
    if (currentGroup.length > 0) {
      // finally, push a last group if there's anything in it
      subGroups.push(currentGroup)
    }

    return subGroups
  })

  // then we can just transform each group into a score with interval
  return groupedScores.map(scoresToIntervalScore)
}

/** Assuming the scores are sorted by timestamp, then this will return the simplified score with the interval */
function scoresToIntervalScore(
  scores: ActivityScore[],
): ActivityScoreWithInterval {
  const end = scores[scores.length - 1].timestamp
  return {
    ...scores[0],
    interval: {
      startTimestamp: scores[0].timestamp,
      endTimestamp: formatISO(
        addHours(utcDateStringToUtc(end), 1),
        dateOptions,
      ),
    },
  }
}
