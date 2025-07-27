import CONSTANTS from '@/constants'
import { DataContext } from '@/types/context'
import { ICache, IDataContextFetcher, ILogger } from '@/types/interfaces'
import { formatISO, parseISO } from 'date-fns'

export class ServerDataFetcher implements IDataContextFetcher {
  constructor(private readonly logger: ILogger) {
    this.logger = logger
  }

  isCacheable(): boolean {
    return true
  }
  async getDataContexts(date: Date): Promise<DataContext[]> {
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
    return []
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
    expiryHours: 24,
  })
  logger.debug('fetched cached data context', {
    key: cacheKey,
    value: cachedResponse,
  })

  if (cachedResponse) {
    logger.warn('returned data from cache', {
      cacheKey,
    })
    return cachedResponse
  }

  let dataContext: DataContext[] | null = null
  let shouldCache: boolean = false

  for (const fetcher of fetchers) {
    logger.debug('trying fetcher', { date, fetcher: fetcher.constructor.name })
    dataContext = await fetcher.getDataContexts(date)
    if (dataContext.length > 0) {
      logger.debug('found valid data with fetcher', {
        contextCount: dataContext.length,
        fetcher: fetcher.constructor.name,
        interval: {
          end: dataContext.at(-1)!.referenceDate,
          start: dataContext[0].referenceDate,
        },
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
    dataContext.forEach((dc) => {
      const key = getCacheKeyFn(cacheKeyFn)(
        lat,
        lng,
        parseISO(dc.referenceDate),
      )
      logger.debug('caching data context', { cacheKey: key })
      cache.setCacheValue(key, dc)
    })
  }
  return dataContext[0]
}
