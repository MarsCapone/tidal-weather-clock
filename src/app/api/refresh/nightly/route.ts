import { deleteDebugData } from '@/app/api/dataContext/[dateString]/debug'
import { OpenMeteoAndEasyTideDataFetcher } from '@/app/api/dataContext/[dateString]/opendatasources'
import logger from '@/app/api/pinoLogger'
import { doRefresh } from '@/app/api/refresh'
import CONSTANTS from '@/lib/constants'
import { db } from '@/lib/db'
import { getAllActivities } from '@/lib/db/helpers/activity'
import { addDataContext } from '@/lib/db/helpers/datacontext'
import { activityScoresTable } from '@/lib/db/schemas/activity'
import { getScores } from '@/lib/score'
import { dateOptions } from '@/lib/utils/dates'
import { addDays, formatISO, startOfToday } from 'date-fns'
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

  await Promise.all(
    dataContexts.map((dc) => addDataContext(dc, CONSTANTS.LOCATION_COORDS)),
  )
  logger.debug('Refreshed data contexts', { count: dataContexts.length })

  const { updatedScoreCount } = await doRefresh({
    scope: 'all',
    userId: null,
    startDate: today,
    endDate: addDays(today, 8),
  })

  logger.info('Cron job completed successfully', {
    dataContextsCount: dataContexts.length,
    date: formatISO(today, dateOptions),
  })

  return Response.json({
    dataContextsCount: dataContexts.length,
    activityScoresCount: updatedScoreCount,
    date: formatISO(today, dateOptions),
    message: 'Cron job completed successfully',
  })
}
