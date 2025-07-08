import { DataContext } from '@/types/data'
import stormglassWeatherExample from './stormGlassWeatherExample.json'
import stormglassTideExample from './stormGlassTideExample.json'
import stormglassSunExample from './stormGlassAstronomyExample.json'
import {
  endOfDay,
  formatISO,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'
import { cacheResponse, getCachedResponse } from '@/utils/cache'
import {
  StormglassSunResponse,
  StormglassTideResponse,
  stormglassWeatherParams,
  StormglassWeatherResponse,
} from '@/types/stormglass'
import { getFractionalTime } from '@/utils/dates'
import CONSTANTS from '@/ui/constants'

export interface DataContextFetcher {
  getDataContext(date: Date): Promise<DataContext>
}

/*
curl -H "Authorization: ${API_KEY}" \
  "https://api.stormglass.io/v2/weather/point?lat=52.9636&lng=0.7442&params=cloudCover,gust,windDirection,windSpeed,airTemperature"
*/

const stormglassBaseUrl = 'https://api.stormglass.io'
const cacheOptions = { expiryHours: 24 }

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
  hasTime: T[],
): T[] {
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
  private readonly coords: [number, number]

  // https://docs.stormglass.io/#/weather

  constructor(coords: [number, number], apiKey?: string) {
    this.coords = coords
    this.apiKey = apiKey
  }

  async callStormglassApi<T>(
    type: 'weather' | 'tide' | 'sun',
  ): Promise<T | null> {
    const [lat, lng] = this.coords

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
  async fetchWeatherResponse(): Promise<StormglassWeatherResponse> {
    const response =
      await this.callStormglassApi<StormglassWeatherResponse>('weather')
    if (response) return response

    return stormglassWeatherExample
  }

  async fetchTideResponse(): Promise<StormglassTideResponse> {
    const response =
      await this.callStormglassApi<StormglassTideResponse>('tide')
    if (response) return response

    return stormglassTideExample as StormglassTideResponse
  }

  async fetchSunResponse(): Promise<StormglassSunResponse> {
    const response = await this.callStormglassApi<StormglassSunResponse>('sun')
    if (response) return response

    return stormglassSunExample as StormglassSunResponse
  }

  async getDataContext(date: Date): Promise<DataContext> {
    const weatherResponse = filterToDate(
      date,
      (await this.fetchWeatherResponse()).hours,
    )
    const tideResponse = filterToDate(
      date,
      (await this.fetchTideResponse()).data,
    )
    const sunResponse = filterToDate(date, (await this.fetchSunResponse()).data)

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
  async callStormglassApi<T>(
    type: 'weather' | 'tide' | 'sun',
  ): Promise<T | null> {
    return null
  }
}

export class ServerDataFetcher implements DataContextFetcher {
  async getDataContext(date: Date): Promise<DataContext> {
    const [lat, lng] = CONSTANTS.LOCATION_COORDS
    const cacheKey = `stormglass-server-[${lat},${lng}]`
    const cachedResponse = getCachedResponse<DataContext>(cacheKey)
    if (cachedResponse) {
      return cachedResponse
    }

    const response = await fetch(`/api/dataContext/${formatISO(date)}`)
    if (response.ok) {
      const json = await response.json()

      if (Object.keys(json).length > 0) {
        cacheResponse(cacheKey, json)
        console.log(json)
        return json
      }
    }

    console.log('falling back to pre-scraped data')
    const demoDataFetcher = new DemoStormglassDataFetcher(
      CONSTANTS.LOCATION_COORDS,
    )
    return await demoDataFetcher.getDataContext(date)
  }
}
