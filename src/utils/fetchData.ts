import { DataContext } from '@/types/data'
import {
  eachDayOfInterval,
  endOfDay,
  formatISO,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'
import { ICache } from '@/utils/cache'
import {
  StormglassSunResponse,
  StormglassTideResponse,
  stormglassWeatherParams,
  StormglassWeatherResponse,
} from '@/types/stormglass'
import { getFractionalTime } from '@/utils/dates'
import CONSTANTS from '@/ui/constants'
import stormglassSunExample from './stormGlassAstronomyExample.json'
import stormglassTideExample from './stormGlassTideExample.json'
import stormglassWeatherExample from './stormGlassWeatherExample.json'
import Logger, { ILogger } from '@/types/logger'

export interface DataContextFetcher {
  isCacheable(): boolean

  // starting at `date` return as may data contexts as can be found
  getDataContexts(date: Date): Promise<DataContext[]>
}

/*
curl -H "Authorization: ${API_KEY}" \
  "https://api.stormglass.io/v2/weather/point?lat=52.9636&lng=0.7442&params=cloudCover,gust,windDirection,windSpeed,airTemperature"
*/

const stormglassBaseUrl = 'https://api.stormglass.io'

function getMeanValueFromSource(
  sourceData: Record<never, number | undefined>,
): number {
  if (!sourceData) return 0

  const values = Object.values(sourceData).filter(
    (value) => typeof value === 'number',
  )
  return values.reduce((a, b) => a + b) / values.length
}

function filterToDate<T extends { time: string }>(
  date: Date,
  hasTime: T[] | null | undefined,
): T[] {
  if (hasTime === null || hasTime === undefined) return []
  const interval = {
    start: startOfDay(date),
    end: endOfDay(date),
  }
  return hasTime.filter(({ time }) =>
    isWithinInterval(parseISO(time), interval),
  )
}

export class DemoStormglassDataFetcher implements DataContextFetcher {
  readonly logger: ILogger

  constructor(logger: ILogger) {
    this.logger = logger
  }

  isCacheable(): boolean {
    return false
  }

  async fetchWeatherResponse(): Promise<StormglassWeatherResponse | null> {
    return stormglassWeatherExample
  }

  async fetchTideResponse(): Promise<StormglassTideResponse | null> {
    return stormglassTideExample as StormglassTideResponse
  }

  async fetchSunResponse(): Promise<StormglassSunResponse | null> {
    return stormglassSunExample
  }

  async getDataContexts(date: Date): Promise<DataContext[]> {
    const [rawWeather, rawTide, rawSun] = [
      await this.fetchWeatherResponse(),
      await this.fetchTideResponse(),
      await this.fetchSunResponse(),
    ]

    // we have to have pulled all data
    if (
      [rawWeather, rawTide, rawSun].some((r) => r === null || r === undefined)
    ) {
      this.logger.warn('not all data sources returned data', {
        date,
        weather: rawWeather !== null,
        tide: rawTide !== null,
        sun: rawSun !== null,
      })
      return []
    }

    // find the minimum time range that all data sources support.
    // start should be the same on all of them.
    // end is either in the meta or needs to be pulled out from the data

    const bestEndSinceEpoch = Math.max(
      ...[
        parseISO(rawWeather!.meta.end).getTime(),
        parseISO(rawTide!.meta.end).getTime(),
        Math.max(...rawSun!.data.map((r) => parseISO(r.time).getTime())),
      ],
    )

    const interval = {
      start: date,
      end: new Date(bestEndSinceEpoch),
    }

    this.logger.debug('fetching data contexts', {
      interval,
      date,
    })

    return eachDayOfInterval(interval).map((d) =>
      this.getDataContext(d, [rawWeather!, rawTide!, rawSun!]),
    )
  }

  getDataContext(
    date: Date,
    rawResponses: [
      StormglassWeatherResponse,
      StormglassTideResponse,
      StormglassSunResponse,
    ],
  ): DataContext {
    const [rawWeather, rawTide, rawSun] = rawResponses
    const [weatherResponse, tideResponse, sunResponse] = [
      filterToDate(date, rawWeather?.hours),
      filterToDate(date, rawTide?.data),
      filterToDate(date, rawSun?.data),
    ]

    const result: DataContext = {
      referenceDate: date,
      sunData: {
        sunSet: sunResponse.length > 0 ? parseISO(sunResponse[0].sunset) : null,
        sunRise:
          sunResponse.length > 0 ? parseISO(sunResponse[0].sunrise) : null,
      },
      tideData: [],
      windData: {
        points: [],
      },
      weatherData: {
        points: [],
      },
    }

    weatherResponse
      .map((r) => ({
        airTemperature: getMeanValueFromSource(r.airTemperature),
        cloudCover: getMeanValueFromSource(r.cloudCover),
        gust: getMeanValueFromSource(r.gust),
        windDirection: getMeanValueFromSource(r.windDirection),
        windSpeed: getMeanValueFromSource(r.windSpeed),
        timestamp: parseISO(r.time),
      }))
      .forEach((hour) => {
        result.windData.points.push({
          timestamp: hour.timestamp,
          direction: hour.windDirection,
          speed: hour.windSpeed,
          gustSpeed: hour.gust,
        })
        result.weatherData.points.push({
          timestamp: hour.timestamp,
          cloudCover: hour.cloudCover,
          temperature: hour.airTemperature,
        })
      })

    tideResponse.forEach((r) => {
      result.tideData.push({
        time: getFractionalTime(parseISO(r.time)),
        type: r.type,
        height: r.height,
      })
    })

    return result
  }
}

export class StormglassDataFetcher extends DemoStormglassDataFetcher {
  private readonly apiKey?: string

  // https://docs.stormglass.io/#/weather

  constructor(logger: ILogger, apiKey: string) {
    super(logger)
    this.apiKey = apiKey
  }

  isCacheable(): boolean {
    return true
  }

  async callStormglassApi<T>(
    type: 'weather' | 'tide' | 'sun',
  ): Promise<T | null> {
    this.logger.debug('calling stormglass api', { apiType: type })

    const [lat, lng] = CONSTANTS.LOCATION_COORDS

    const urls = {
      weather: `${stormglassBaseUrl}/v2/weather/point?lat=${lat}&lng=${lng}&params=${stormglassWeatherParams.join(',')}`,
      tide: `${stormglassBaseUrl}/v2/tide/extremes/point?lat=${lat}&lng=${lng}`,
      sun: `${stormglassBaseUrl}/v2/astronomy/point?lat=${lat}&lng=${lng}`,
    }
    const response = await fetch(urls[type], {
      headers: { Authorization: this.apiKey! },
    })
    const content = await response.json()

    if (response.ok) {
      return content
    }

    this.logger.error('error fetching stormglass data', {
      apiType: type,
      statusCode: response.status,
      statusText: response.statusText,
      content,
    })
    return null
  }
  async fetchWeatherResponse(): Promise<StormglassWeatherResponse | null> {
    return await this.callStormglassApi<StormglassWeatherResponse>('weather')
  }

  async fetchTideResponse(): Promise<StormglassTideResponse | null> {
    return this.callStormglassApi<StormglassTideResponse>('tide')
  }

  async fetchSunResponse(): Promise<StormglassSunResponse | null> {
    return await this.callStormglassApi<StormglassSunResponse>('sun')
  }
}

export class ServerDataFetcher implements DataContextFetcher {
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
      date,
      statusCode: response.status,
      statusText: response.statusText,
      content,
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
  logger: Logger,
  date: Date,
  fetchers: DataContextFetcher[],
  cache: ICache,
  cacheKeyFn: (lat: number, lng: number, date: Date) => string,
): Promise<DataContext | null> {
  logger.info('attempting to fetch data context', {
    fetchers: fetchers.map((f) => f.constructor.name),
    date,
  })

  const [lat, lng] = CONSTANTS.LOCATION_COORDS

  const cacheKey = getCacheKeyFn(cacheKeyFn)(lat, lng, date)
  const cachedResponse = cache.getCacheValue<DataContext>(cacheKey, {
    expiryHours: 24,
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
    logger.debug('trying fetcher', { fetcher: fetcher.constructor.name, date })
    dataContext = await fetcher.getDataContexts(date)
    if (dataContext.length > 0) {
      logger.debug('found valid data with fetcher', {
        fetcher: fetcher.constructor.name,
        contextCount: dataContext.length,
        interval: {
          start: dataContext[0].referenceDate,
          end: dataContext[dataContext.length - 1].referenceDate,
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
      const key = getCacheKeyFn(cacheKeyFn)(lat, lng, dc.referenceDate)
      logger.debug('caching data context', { cacheKey: key })
      cache.setCacheValue<DataContext>(key, dc)
    })
  }
  return dataContext[0]
}
