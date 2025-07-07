import { DataContext } from '@/types/data'
import stormGlassWeatherResponseExample from './stormGlassExample.json'
import CONSTANTS from '@/ui/constants'
import {
  differenceInDays,
  differenceInHours,
  endOfDay,
  formatISO,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'
import { cacheResponse, getCachedResponse } from '@/utils/cache'

export interface DataContextFetcher {
  getDataContext(date: Date): Promise<DataContext>
}

/*
curl -H "Authorization: ${API_KEY}" \
  "https://api.stormglass.io/v2/weather/point?lat=52.9636&lng=0.7442&params=cloudCover,gust,windDirection,windSpeed,airTemperature"
*/

const stormGlassWeatherParams = [
  'cloudCover',
  'gust',
  'windDirection',
  'windSpeed',
  'airTemperature',
]

type StormglassSourceData = {
  [source: string]: number | undefined
}
type StormglassTimestampResponse = {
  time: string
  cloudCover: StormglassSourceData
  gust: StormglassSourceData
  windDirection: StormglassSourceData
  windSpeed: StormglassSourceData
  airTemperature: StormglassSourceData
}
type StormglassMeta = {
  cost: number
  requestCount: number
  dailyQuota: number
  lat: number
  lng: number
  start: string
  end: string
  params: (typeof stormGlassWeatherParams)[number][]
}
type StormglassWeatherResponse = {
  hours: StormglassTimestampResponse[]
  meta: StormglassMeta
}

export class StormglassDataFetcher implements DataContextFetcher {
  private readonly apiKey?: string

  // https://docs.stormglass.io/#/weather

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  async fetchWeatherResponse(): Promise<StormglassWeatherResponse> {
    const [lat, lng] = CONSTANTS.BURNHAM_OVERY_STAITHE_COORDS

    const cachedResponse = getCachedResponse<StormglassWeatherResponse>(
      'stormglass-weather',
      {
        expiryHours: 36,
      },
    )
    if (cachedResponse) {
      return cachedResponse
    }

    if (this.apiKey) {
      console.log('fetching weather response from api')
      const response = await fetch(
        `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${stormGlassWeatherParams.join(',')}`,
        {
          headers: {
            Authorization: this.apiKey,
          },
        },
      )
      const json = await response.json()
      cacheResponse('stormglass-weather', json)
      return json
    }

    console.log('fetching weather response from static data')
    return stormGlassWeatherResponseExample
  }

  getMeanValueFromSource(sourceData: StormglassSourceData): number {
    if (!sourceData) return 0

    const values = Object.values(sourceData).filter(
      (value) => typeof value === 'number',
    )
    return values.reduce((a, b) => a + b) / values.length
  }

  async getDataContext(date: Date): Promise<DataContext> {
    const weatherResponse = await this.fetchWeatherResponse()
    const interval = {
      start: startOfDay(date),
      end: endOfDay(date),
    }

    const relevantHours = weatherResponse.hours
      .filter(({ time }) => isWithinInterval(parseISO(time), interval))
      .map((str) => ({
        airTemperature: this.getMeanValueFromSource(str.airTemperature),
        cloudCover: this.getMeanValueFromSource(str.cloudCover),
        gust: this.getMeanValueFromSource(str.gust),
        windDirection: this.getMeanValueFromSource(str.windDirection),
        windSpeed: this.getMeanValueFromSource(str.windSpeed),
        timestamp: parseISO(str.time),
      }))

    const result: DataContext = {
      referenceDate: date,
      sunData: {
        sunSet: date,
        sunRise: date,
      },
      tideData: [],
      windData: {
        points: [],
      },
      weatherData: {
        points: [],
      },
    }

    relevantHours.forEach((hour) => {
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

    return result
  }
}

class DemoDataFetcher implements DataContextFetcher {
  async getDataContext(date: Date): Promise<DataContext> {
    return {
      referenceDate: startOfDay(date),
      sunData: {
        sunRise: new Date(2025, 4, 22, 6, 10),
        sunSet: new Date(2025, 4, 22, 20, 43),
      },
      tideData: [
        {
          height: 1.8,
          time: 10.5,
          type: 'high',
        },
        {
          height: 2.0,
          time: 22.75,
          type: 'high',
        },
        {
          height: 0.7,
          time: 16 + 10 / 60,
          type: 'low',
        },
      ],
      weatherData: { points: [] },
      windData: { points: [] },
    } as DataContext
  }
}
