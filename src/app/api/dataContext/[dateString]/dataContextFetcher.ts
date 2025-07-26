import CONSTANTS from '@/constants'
import { DataContext } from '@/types/context'
import { IDataContextFetcher, ILogger } from '@/types/interfaces'
import {
  StormglassSunResponse,
  StormglassTideResponse,
  stormglassWeatherParams,
  StormglassWeatherResponse,
} from '@/types/stormglass'
import { getFractionalTime } from '@/utils/dates'
import {
  eachDayOfInterval,
  endOfDay,
  formatISO,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'
import stormglassSunExample from './stormGlassAstronomyExample.json'
import stormglassTideExample from './stormGlassTideExample.json'
import stormglassWeatherExample from './stormGlassWeatherExample.json'

const stormglassBaseUrl = 'https://api.stormglass.io'

function getMeanValueFromSource(
  sourceData: Record<never, number | undefined>,
): number {
  if (!sourceData) {
    return 0
  }

  const values = Object.values(sourceData).filter(
    (value) => typeof value === 'number',
  )
  return values.reduce((a, b) => a + b) / values.length
}

function filterToDate<T extends { time: string }>(
  date: Date,
  hasTime: T[] | null | undefined,
): T[] {
  if (hasTime === null || hasTime === undefined) {
    return []
  }
  const interval = {
    end: endOfDay(date),
    start: startOfDay(date),
  }
  return hasTime.filter(({ time }) =>
    isWithinInterval(parseISO(time), interval),
  )
}

export class DemoStormglassDataFetcher implements IDataContextFetcher {
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
        sun: rawSun !== null,
        tide: rawTide !== null,
        weather: rawWeather !== null,
      })
      return []
    }

    // find the minimum time range that all data sources support.
    // start should be the same on all of them.
    // end is either in the meta or needs to be pulled out from the data

    const bestEndSinceEpoch = Math.max(
      parseISO(rawWeather!.meta.end).getTime(),
      parseISO(rawTide!.meta.end).getTime(),
      Math.max(...rawSun!.data.map((r) => parseISO(r.time).getTime())),
    )

    const interval = {
      end: new Date(bestEndSinceEpoch),
      start: date,
    }

    this.logger.debug('fetching data contexts', {
      date,
      interval,
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
      referenceDate: formatISO(startOfDay(parseISO(sunResponse[0].sunrise))),
      sunData: {
        sunRise: sunResponse[0].sunrise,
        sunSet: sunResponse[0].sunset,
      },
      tideData: [],
      weatherData: {
        points: [],
      },
      windData: {
        points: [],
      },
    }

    weatherResponse
      .map((r) => ({
        airTemperature: getMeanValueFromSource(r.airTemperature),
        cloudCover: getMeanValueFromSource(r.cloudCover),
        gust: getMeanValueFromSource(r.gust),
        timestamp: r.time,
        windDirection: getMeanValueFromSource(r.windDirection),
        windSpeed: getMeanValueFromSource(r.windSpeed),
      }))
      .forEach((hour) => {
        result.windData.points.push({
          direction: hour.windDirection,
          gustSpeed: hour.gust,
          speed: hour.windSpeed,
          timestamp: hour.timestamp,
        })
        result.weatherData.points.push({
          cloudCover: hour.cloudCover,
          temperature: hour.airTemperature,
          timestamp: hour.timestamp,
        })
      })

    tideResponse.forEach((r) => {
      result.tideData.push({
        height: r.height,
        time: getFractionalTime(parseISO(r.time)),
        type: r.type,
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
      sun: `${stormglassBaseUrl}/v2/astronomy/point?lat=${lat}&lng=${lng}`,
      tide: `${stormglassBaseUrl}/v2/tide/extremes/point?lat=${lat}&lng=${lng}`,
      weather: `${stormglassBaseUrl}/v2/weather/point?lat=${lat}&lng=${lng}&params=${stormglassWeatherParams.join(',')}`,
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
      content,
      statusCode: response.status,
      statusText: response.statusText,
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
