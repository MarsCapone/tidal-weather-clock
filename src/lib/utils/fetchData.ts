import CONSTANTS from '@/constants'
import { utcDateStringToUtc } from '@/lib/utils/dates'
import { DataContext } from '@/types/context'
import { ICache, IDataContextFetcher, ILogger } from '@/types/interfaces'
import { formatISO } from 'date-fns'

export class ServerDataFetcher implements IDataContextFetcher {
  constructor(private readonly logger: ILogger) {
    this.logger = logger
  }

  isCacheable(): boolean {
    return true
  }
  async getDataContext(date: Date): Promise<DataContext | null> {
    this.logger.debug('fetching data context from server', { date })
    const response = await fetch(`/api/dataContext/${formatISO(date)}`)
    const content = await response.json()

    if (response.ok && content) {
      return content
    }

    this.logger.warn('error fetching data context from server', {
      content,
      date,
      statusCode: response.status,
      statusText: response.statusText,
    })
    return null
  }

  async getDataContexts(date: Date): Promise<DataContext[]> {
    const context = await this.getDataContext(date)
    if (!context) {
      return []
    }
    return [context]
  }
}

type CacheKeyFn = (lat: number, lng: number, date: Date) => string
const CACHE_PREFIX = `dataContext-`
function getCacheKeyFn(fn: CacheKeyFn): CacheKeyFn {
  return (lat: number, lng: number, date: Date) =>
    `${CACHE_PREFIX}${fn(lat, lng, date)}`
}

export default async function tryDataFetchersWithCache(
  logger: ILogger,
  date: Date,
  fetchers: IDataContextFetcher[],
  cache: ICache<DataContext>,
  cacheKeyFn: (lat: number, lng: number, date: Date) => string,
): Promise<DataContext | null> {
  logger.info('attempting to fetch data context', {
    date,
    fetchers: fetchers.map((f) => f.constructor.name),
  })

  const [lat, lng] = CONSTANTS.LOCATION_COORDS

  const cacheKey = getCacheKeyFn(cacheKeyFn)(lat, lng, date)
  const cachedResponse = cache.getCacheValue(cacheKey, {
    // data is stored on the server too, so this just prevents repeated calls
    // to the server
    expiryHours: 2,
  })
  logger.debug('fetched cached data context', {
    cache: cache.constructor.name,
    key: cacheKey,
    value: cachedResponse,
  })

  if (cachedResponse) {
    logger.warn('returned data from cache', {
      cache: cache.constructor.name,
      cacheKey,
    })
    return cachedResponse
  }

  let dataContext: DataContext | null = null
  let shouldCache: boolean = false

  for (const fetcher of fetchers) {
    logger.debug('trying fetcher', { date, fetcher: fetcher.constructor.name })
    dataContext = await fetcher.getDataContext(date)

    if (dataContext !== null) {
      logger.debug('found valid data with fetcher', {
        date: dataContext.referenceDate,
        fetcher: fetcher.constructor.name,
      })
      shouldCache = fetcher.isCacheable()
      break
    }
  }

  if (dataContext === null) {
    // no data was found via any fetcher
    logger.error('no data contexts found via any fetcher', {
      date,
      fetchers: fetchers.map((f) => f.constructor.name),
    })
    return null
  }

  if (shouldCache) {
    const key = getCacheKeyFn(cacheKeyFn)(
      lat,
      lng,
      utcDateStringToUtc(dataContext.referenceDate),
    )
    logger.debug('caching data context', {
      cache: cache.constructor.name,
      cacheKey: key,
    })
    cache.setCacheValue(key, dataContext)
  }
  return dataContext
}
