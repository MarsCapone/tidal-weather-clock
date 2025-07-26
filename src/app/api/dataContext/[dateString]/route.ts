import { DebugMemoryCache } from '@/app/api/dataContext/[dateString]/cache'
import { StormglassDataFetcher } from '@/app/api/dataContext/[dateString]/dataContextFetcher'
import logger from '@/app/api/pinoLogger'
import { DataContext } from '@/types/context'
import { min, parseISO, startOfDay } from 'date-fns'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dateString: string }> },
) {
  const { dateString } = await params
  const result = await getDataContextsForDateString(dateString)
  return Response.json(result)
}

const cache = new DebugMemoryCache<DataContext[]>()
const dataFetcher = new StormglassDataFetcher(
  logger,
  process.env.STORMGLASS_API_KEY!,
)
async function getDataContextsForDateString(
  dateString: string,
): Promise<DataContext[]> {
  // query the earliest of either the provided date or today
  const queryDay = min([
    startOfDay(parseISO(dateString)),
    startOfDay(new Date()),
  ])

  const cachedData = cache.getCacheValue('all-contexts', {
    expiryHours: 4,
  })
  if (!cachedData) {
    logger.info('fetching data', {
      dateString,
      fetcher: dataFetcher.constructor.name,
    })
    const data = await dataFetcher.getDataContexts(queryDay)

    cache.setCacheValue('all-contexts', data)
    return data
  }
  return []
}
