import { DataContext } from '@/types/context'
import { min, parseISO, startOfDay } from 'date-fns'
import { DebugMemoryCache } from '@/backend/utils/cache'
import logger from '@/backend/utils/pinoLogger'
import { StormglassDataFetcher } from '@/backend/utils/dataContextFetcher'

const cache = new DebugMemoryCache()
const dataFetcher = new StormglassDataFetcher(
  logger,
  Bun.env.STORMGLASS_API_KEY!,
)

export default async function getDataContextsForDateString(
  dateString: string,
): Promise<DataContext[]> {
  // query the earliest of either the provided date or today
  const queryDay = min([
    startOfDay(parseISO(dateString)),
    startOfDay(new Date()),
  ])

  const cachedData = cache.getCacheValue<DataContext[]>('all-contexts', {
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
