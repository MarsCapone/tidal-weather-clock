import logger from '@/app/api/pinoLogger'
import { doRefresh, refreshDataContexts } from '@/app/api/refresh'
import CONSTANTS from '@/lib/constants'
import { dateOptions } from '@/lib/utils/dates'
import { deleteDebugData } from '@/lib/utils/debug'
import { addDays, formatISO, startOfToday } from 'date-fns'

export async function GET(): Promise<Response> {
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
  const dataContextIds = await refreshDataContexts()

  const { updatedScoreCount } = await doRefresh({
    scope: 'all',
    userId: null,
    startDate: today,
    endDate: addDays(today, 8),
  })

  logger.info('Cron job completed successfully', {
    dataContextsCount: dataContextIds.length,
    date: formatISO(today, dateOptions),
  })

  return Response.json({
    dataContextsCount: dataContextIds.length,
    activityScoresCount: updatedScoreCount,
    date: formatISO(today, dateOptions),
    message: 'Cron job completed successfully',
  })
}
