import { DataContext } from '@/types/data'
import {
  eachDayOfInterval,
  endOfDay,
  formatISO,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'
import { setCachedResponse, getCachedResponse } from '@/utils/cache'
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

export class StormglassDataFetcher implements DataContextFetcher {
  private readonly apiKey?: string

  // https://docs.stormglass.io/#/weather

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  isCacheable(): boolean {
    return true
  }

  async callStormglassApi<T>(
    type: 'weather' | 'tide' | 'sun',
  ): Promise<T | null> {
    const [lat, lng] = CONSTANTS.LOCATION_COORDS

    const urls = {
      weather: `${stormglassBaseUrl}/v2/weather/point?lat=${lat}&lng=${lng}&params=${stormglassWeatherParams.join(',')}`,
      tide: `${stormglassBaseUrl}/v2/tide/extremes/point?lat=${lat}&lng=${lng}`,
      sun: `${stormglassBaseUrl}/v2/astronomy/point?lat=${lat}&lng=${lng}`,
    }

    if (this.apiKey) {
      console.log(`fetching ${type} data from stormglass api`)
      const response = await fetch(urls[type], {
        headers: { Authorization: this.apiKey },
      })
      if (response.ok) {
        return await response.json()
      } else {
        console.error(
          `error fetching ${type} data from stormglass api`,
          response.status,
        )
      }
    }
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

    const datesToCheck = eachDayOfInterval({
      start: date,
      end: new Date(bestEndSinceEpoch),
    })

    return datesToCheck.map((d) =>
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

export class DemoStormglassDataFetcher extends StormglassDataFetcher {
  constructor() {
    super()
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
}

export class ServerDataFetcher implements DataContextFetcher {
  isCacheable(): boolean {
    return true
  }
  async getDataContexts(date: Date): Promise<DataContext[]> {
    const response = await fetch(`/api/dataContext/${formatISO(date)}`)
    if (response.ok) {
      const json = await response.json()

      if (Object.keys(json).length > 0) {
        return json
      }
    }
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
  date: Date,
  fetchers: DataContextFetcher[],
  cacheKeyFn: (lat: number, lng: number, date: Date) => string,
): Promise<DataContext | null> {
  const [lat, lng] = CONSTANTS.LOCATION_COORDS

  const cacheKey = getCacheKeyFn(cacheKeyFn)(lat, lng, date)
  const cachedResponse = getCachedResponse<DataContext>(cacheKey, {
    expiryHours: 24,
  })
  if (cachedResponse) {
    console.warn(`returning cached data`, cacheKey)
    return cachedResponse
  }

  let dataContext: DataContext[] | null = null
  let shouldCache: boolean = false

  for (const fetcher of fetchers) {
    console.log('trying to fetch dataContext', fetcher.constructor.name)
    dataContext = await fetcher.getDataContexts(date)
    if (dataContext.length > 0) {
      console.log(
        'found dataContexts with fetcher',
        fetcher.constructor.name,
        dataContext.length,
      )
      shouldCache = fetcher.isCacheable()
      break
    }
  }

  if (dataContext === null) {
    // no data was found via any fetcher
    console.error('no data contexts found via any fetcher')
    return null
  }

  if (shouldCache) {
    dataContext.forEach((dc) => {
      const key = getCacheKeyFn(cacheKeyFn)(lat, lng, dc.referenceDate)
      console.log('caching dataContext', key)
      setCachedResponse(key, dc)
    })
  }
  return dataContext[0]
}
