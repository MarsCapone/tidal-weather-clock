import logger from '@/app/api/pinoLogger'
import { OpenMeteoAndEasyTideDataFetcher } from '@/app/api/refresh/opendatasources'
import CONSTANTS from '@/lib/constants'
import { db } from '@/lib/db'
import {
  getActivitiesByUserId,
  getAllActivities,
} from '@/lib/db/helpers/activity'
import {
  addDataContext,
  getDataContextsByDateRange,
} from '@/lib/db/helpers/datacontext'
import { activityScoresTable } from '@/lib/db/schemas/activity'
import { getScores } from '@/lib/score'
import { utcDateStringToUtc } from '@/lib/utils/dates'
import { addDays } from 'date-fns'
import { sql } from 'drizzle-orm'

function cartesianProduct<A, B>(a: A[], b: B[]): [A, B][] {
  const sets = [a, b]
  return sets.reduce<(A | B)[][]>(
    (results, ids) =>
      results
        .map((result) => ids.map((id) => [...result, id]))
        .reduce((nested, result) => [...nested, ...result]),
    [[]],
  ) as [A, B][]
}

export type DoRefreshOptions = {
  scope: 'user' | 'global' | 'all'
  userId?: string | null
  startDate: Date | string
  endDate: Date | string | number
  refreshDataContext?: boolean
}

export async function doRefresh({
  scope,
  userId,
  startDate,
  endDate,
  refreshDataContext = false,
}: DoRefreshOptions) {
  userId ??= null
  if (scope === 'user' && userId === null) {
    throw new Error('userId is required when scope is user')
  }

  if (typeof startDate === 'string') {
    startDate = utcDateStringToUtc(startDate)
  }
  if (typeof endDate === 'string') {
    endDate = utcDateStringToUtc(endDate)
  } else if (typeof endDate === 'number') {
    endDate = addDays(startDate, endDate)
  }

  const updatedDataContextCount = refreshDataContext
    ? (await refreshDataContexts()).length
    : 0

  const activities =
    scope === 'user'
      ? await getActivitiesByUserId(userId)
      : await getAllActivities()

  const dataContextWrappers = await getDataContextsByDateRange(
    startDate,
    endDate,
    CONSTANTS.LOCATION_COORDS,
  )

  const dataContextActivityPairs = cartesianProduct(
    dataContextWrappers.map(({ dataContext, id }) => ({ ...dataContext, id })),
    activities,
  )

  logger.debug(
    'Calculating scores for all activities and data contexts for all users. This may take a while.',
    {
      count: dataContextActivityPairs.length,
    },
  )

  const allScores = await Promise.all(
    dataContextActivityPairs.map(([dataContext, activity]) =>
      getScores({ dataContext, activity }),
    ),
  )

  const allActivityScoreValues = dataContextActivityPairs.flatMap(
    ([dataContext, activity], i) => {
      return allScores[i].map(({ timestamp, value, debug }) => ({
        datacontext_id: dataContext.id,
        activity_id: activity.id,
        activity_version: activity.version,
        timestamp,
        score: value,
        debug,
      }))
    },
  )

  await db
    .insert(activityScoresTable)
    .values(allActivityScoreValues)
    .onConflictDoUpdate({
      target: [
        activityScoresTable.activity_id,
        activityScoresTable.activity_version,
        activityScoresTable.datacontext_id,
        activityScoresTable.timestamp,
      ],
      set: {
        score: sql.raw(`excluded.${activityScoresTable.score.name}`),
        debug: sql.raw(`excluded.${activityScoresTable.debug.name}`),
      },
    })

  logger.debug(
    'Inserted all scores for all activities, data contexts and users',
    {
      count: allActivityScoreValues.length,
      averageScoresPerActivity:
        allActivityScoreValues.length / dataContextActivityPairs.length,
    },
  )

  return {
    updatedDataContextCount,
    updatedScoreCount: allActivityScoreValues.length,
  }
}

export async function refreshDataContexts() {
  const dataFetcher = new OpenMeteoAndEasyTideDataFetcher(logger)
  const dataContexts = await dataFetcher.getDataContexts()

  const ids = await Promise.all(
    dataContexts.map((dc) => addDataContext(dc, CONSTANTS.LOCATION_COORDS)),
  )
  logger.debug('Refreshed data contexts', { count: dataContexts.length })
  return ids
}
