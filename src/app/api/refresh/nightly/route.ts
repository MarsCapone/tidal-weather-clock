import { deleteDebugData } from '@/app/api/dataContext/[dateString]/debug'
import { OpenMeteoAndEasyTideDataFetcher } from '@/app/api/dataContext/[dateString]/opendatasources'
import logger from '@/app/api/pinoLogger'
import CONSTANTS from '@/lib/constants'
import { db } from '@/lib/db'
import { getAllActivities } from '@/lib/db/helpers/activity'
import { addDataContext } from '@/lib/db/helpers/datacontext'
import { activityScoresTable } from '@/lib/db/schemas/activity'
import { getScores } from '@/lib/score'
import { dateOptions } from '@/lib/utils/dates'
import { formatISO, startOfToday } from 'date-fns'
import { sql } from 'drizzle-orm'
import fastCartesian from 'fast-cartesian'

export async function GET(request: Request): Promise<Response> {
  /* This handler will be called when the cron job runs.
   * So the logic here should be to perform the necessary tasks that run on a
   * schedule. Namely, two things:
   * 1. Delete old debug data
   * 2. Refresh all the data contexts, ignoring the cache.
   */

  await Promise.all([
    deleteDebugData(CONSTANTS.MAX_BLOB_STORAGE_DAYS, 'dataContextSource'),
    deleteDebugData(CONSTANTS.MAX_BLOB_STORAGE_DAYS, 'dataContext'),
    deleteDebugData(CONSTANTS.MAX_BLOB_STORAGE_DAYS, 'activityScore'),
  ])
  logger.debug('Deleted debug data', { age: CONSTANTS.MAX_BLOB_STORAGE_DAYS })

  // refresh all data contexts
  const today = startOfToday(dateOptions)
  const dataFetcher = new OpenMeteoAndEasyTideDataFetcher(logger)
  const dataContexts = await dataFetcher.getDataContexts(today)

  const dcids = await Promise.all(
    dataContexts.map((dc) => addDataContext(dc, CONSTANTS.LOCATION_COORDS)),
  )
  logger.debug('Refreshed data contexts', { count: dataContexts.length })

  // calculate and store scores for all activities for all users
  const allActivities = await getAllActivities()

  const dcActivityPairs = fastCartesian([
    dataContexts.map((dc, i) => ({ ...dc, id: dcids[i] })),
    allActivities,
  ])

  logger.debug(
    'Calculating scores for all activities and data contexts for all users. This may take a while.',
    {
      count: dcActivityPairs.length,
    },
  )

  const allScores = await Promise.all(
    dcActivityPairs.map(([dataContext, activity]) =>
      getScores({ dataContext, activity }),
    ),
  )

  const allActivityScoreValues = dcActivityPairs.flatMap(
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

  logger.debug(
    'Preparing to insert all scores for all activities, data contexts and users',
    {
      count: allActivityScoreValues.length,
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
        allActivityScoreValues.length / dcActivityPairs.length,
    },
  )

  logger.info('Cron job completed successfully', {
    dataContextsCount: dataContexts.length,
    date: formatISO(today, dateOptions),
  })

  return Response.json({
    dataContextsCount: dataContexts.length,
    activityScoresCount: allActivityScoreValues.length,
    date: formatISO(today, dateOptions),
    message: 'Cron job completed successfully',
  })
}
