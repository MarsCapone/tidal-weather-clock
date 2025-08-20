import { deleteDebugData } from '@/app/api/dataContext/[dateString]/debug'
import { OpenMeteoAndEasyTideDataFetcher } from '@/app/api/dataContext/[dateString]/opendatasources'
import logger from '@/app/api/pinoLogger'
import CONSTANTS from '@/lib/constants'
import { addDataContext } from '@/lib/db/helpers/datacontext'
import { dateOptions } from '@/lib/utils/dates'
import { formatISO, startOfToday } from 'date-fns'

export async function GET(request: Request): Promise<Response> {
  /* This handler will be called when the cron job runs.
   * So the logic here should be to perform the necessary tasks that run on a
   * schedule. Namely, two things:
   * 1. Delete old debug data
   * 2. Refresh all the data contexts, ignoring the cache.
   */

  await deleteDebugData(CONSTANTS.MAX_BLOB_STORAGE_DAYS, 'dataContextSource')
  await deleteDebugData(CONSTANTS.MAX_BLOB_STORAGE_DAYS, 'dataContext')

  const today = startOfToday(dateOptions)
  const dataFetcher = new OpenMeteoAndEasyTideDataFetcher(logger)
  const dataContexts = await dataFetcher.getDataContexts(today)

  await Promise.all(
    dataContexts.map((dc) => addDataContext(dc, CONSTANTS.LOCATION_COORDS)),
  )

  logger.info('Cron job completed successfully', {
    dataContextsCount: dataContexts.length,
    date: formatISO(today, dateOptions),
  })

  return Response.json({
    dataContextsCount: dataContexts.length,
    date: formatISO(today, dateOptions),
    message: 'Cron job completed successfully',
  })
}
