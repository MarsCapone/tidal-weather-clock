import { uploadDebugData } from '@/app/api/dataContext/[dateString]/debug'
import CONSTANTS from '@/lib/constants'
import { DataContext, TideInfo } from '@/lib/types/context'
import { IDataContextFetcher, ILogger } from '@/lib/types/interfaces'
import {
  dateOptions,
  utcDateStringAddFractional,
  utcDateStringToFractionalUtc,
  utcDateStringToUtc,
} from '@/lib/utils/dates'
import { calcMean } from '@/lib/utils/math'
import { TZDate } from '@date-fns/tz'
import {
  addDays,
  eachDayOfInterval,
  formatISO,
  isEqual,
  startOfToday,
} from 'date-fns'

type EasyTideData = {
  footerNote?: string
  lunarPhaseList?: {
    dateTime: string
    lunarPhaseType: number
  }[]
  tidalEventList: {
    date: string
    dateTime: string
    eventType: 0 | 1 // 0 - high tide, 1 - low tide
    height: number
    isApproximate?: boolean | null
    isApproximateHeight?: boolean | null
  }[]
  tidalHeightOccurrenceList?: {
    dateTime: string
    height: number
  }[]
}

type OpenMeteoData = {
  daily: {
    daylight_duration: number[]
    sunrise: string[]
    sunset: string[]
    time: string[]
    wind_direction_10m_dominant: number[]
    wind_gusts_10m_max: number[]
    wind_speed_10m_max: number[]
  }
  daily_units: Record<string, string>
  elevation: number
  generationtime_ms: number
  hourly: {
    cloud_cover: number[]
    is_day: number[]
    precipitation: number[]
    precipitation_probability: number[]
    rain: number[]
    sunshine_duration: number[]
    temperature_2m: number[]
    time: string[]
    uv_index: number[]
    wind_direction_10m: number[]
    wind_gusts_10m: number[]
    wind_speed_10m: number[]
  }
  hourly_units: Record<string, string>
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  utc_offset_seconds: number
}

type OpenMeteoHourlyPoint = {
  cloudCover: number
  precipitation: number
  precipitationProbability: number
  rain: number
  sunshineDuration: number
  temperature: number
  timestamp: string
  uvIndex: number
  windDirection: number
  windGusts: number
  windSpeed: number
}

type OpenMeteoDailyPoint = {
  date: string
  daylightDuration: number
  sunrise: string
  sunset: string
  windDirectionDominant: number
  windGustsMax: number
  windSpeedMax: number
}

export class OpenMeteoAndEasyTideDataFetcher implements IDataContextFetcher {
  private logger: ILogger

  constructor(logger: ILogger) {
    this.logger = logger
  }

  isCacheable(): boolean {
    return true
  }

  async getEasyTideData(stationId: string): Promise<EasyTideData | null> {
    const response = await fetch(
      `https://easytide.admiralty.co.uk/Home/GetPredictionData?stationId=${stationId}`,
    )
    if (!response.ok) {
      this.logger.error('Failed to fetch EasyTide data', {
        status: response.status,
        statusText: response.statusText,
      })
      return null
    }

    const content = await response.json()
    if (!content || !content.tidalEventList) {
      this.logger.warn('Invalid EasyTide data received', { content })
      return null
    }

    return content as EasyTideData
  }

  async getOpenMeteoData(): Promise<OpenMeteoData | null> {
    const params = {
      cell_selection: 'nearest',
      daily: [
        'sunrise',
        'sunset',
        'wind_direction_10m_dominant',
        'wind_gusts_10m_max',
        'wind_speed_10m_max',
        'daylight_duration',
      ],
      forecast_days: 7, // matches max info returned from EasyTide
      forecast_hours: 24 * 7,
      hourly: [
        'temperature_2m',
        'precipitation',
        'rain',
        'cloud_cover',
        'wind_speed_10m',
        'wind_direction_10m',
        'uv_index',
        'is_day',
        'sunshine_duration',
        'wind_gusts_10m',
        'precipitation_probability',
      ],
      latitude: CONSTANTS.LOCATION_COORDS[0],
      longitude: CONSTANTS.LOCATION_COORDS[1],
      models: 'gfs_seamless',
      past_days: 1,
      past_hours: 24,
      wind_speed_unit: 'ms',
    }
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        url.searchParams.append(key, value.join(','))
      } else {
        url.searchParams.set(key, String(value))
      }
    })

    const response = await fetch(url)
    if (!response.ok) {
      this.logger.error('Failed to fetch OpenMeteo data', {
        status: response.status,
        statusText: response.statusText,
      })
      return null
    }

    const content = await response.json()
    return content as OpenMeteoData
  }

  async getDataContext(date: Date): Promise<DataContext | null> {
    return null
  }

  async getDataContexts(date: Date): Promise<DataContext[]> {
    // easytide always returns data for the next 7 days
    // open-meteo we have configured to return data for the next 7 days
    // all dates are UTC, so we don't need to convert them
    const easyTideData = await this.getEasyTideData(
      CONSTANTS.LOCATION_EASYTIDE_STATION_ID,
    )
    const openMeteoData = await this.getOpenMeteoData()

    if (!easyTideData || !openMeteoData) {
      this.logger.error('Failed to fetch data from EasyTide or OpenMeteo')
      return []
    }

    const today = startOfToday(dateOptions)
    const dates = eachDayOfInterval({
      end: addDays(today, 7),
      start: today,
    })

    const hourlyPoints: OpenMeteoHourlyPoint[] = openMeteoData.hourly.time.map(
      (hour, i) => {
        return {
          cloudCover: openMeteoData.hourly.cloud_cover[i],
          precipitation: openMeteoData.hourly.precipitation[i],
          precipitationProbability:
            openMeteoData.hourly.precipitation_probability[i],
          rain: openMeteoData.hourly.rain[i],
          sunshineDuration: openMeteoData.hourly.sunshine_duration[i],
          temperature: openMeteoData.hourly.temperature_2m[i],
          timestamp: hour,
          uvIndex: openMeteoData.hourly.uv_index[i],
          windDirection: openMeteoData.hourly.wind_direction_10m[i],
          windGusts: openMeteoData.hourly.wind_gusts_10m[i],
          windSpeed: openMeteoData.hourly.wind_speed_10m[i],
        }
      },
    )

    const dailyPoints: OpenMeteoDailyPoint[] = openMeteoData.daily.time.map(
      (day, idx) => {
        return {
          date: day,
          daylightDuration: openMeteoData.daily.daylight_duration[idx],
          sunrise: openMeteoData.daily.sunrise[idx],
          sunset: openMeteoData.daily.sunset[idx],
          windDirectionDominant:
            openMeteoData.daily.wind_direction_10m_dominant[idx],
          windGustsMax: openMeteoData.daily.wind_gusts_10m_max[idx],
          windSpeedMax: openMeteoData.daily.wind_speed_10m_max[idx],
        }
      },
    )

    await uploadDebugData(
      'dataContextSource',
      `openmeteo+easytide-${formatISO(new Date(), dateOptions)}`,
      {
        dailyPoints,
        hourlyPoints,
        rawData: { easyTideData, openMeteoData },
      },
    )

    return dates
      .map((d) => {
        try {
          return this.makeDataContext(
            d,
            easyTideData,
            hourlyPoints,
            dailyPoints,
          )
        } catch {
          return null
        }
      })
      .filter((d) => d !== null) as DataContext[]
  }

  makeDataContext(
    date: TZDate,
    easyTideData: EasyTideData,
    openMeteoHourly: OpenMeteoHourlyPoint[],
    openMeteoDaily: OpenMeteoDailyPoint[],
  ): DataContext {
    const referenceDate = formatISO(date, dateOptions)
    const hourlyPoints = openMeteoHourly.filter((hour) =>
      hour.timestamp.startsWith(
        formatISO(date, { ...dateOptions, representation: 'date' }),
      ),
    )
    const dailyPoint = openMeteoDaily.find(
      (day) =>
        day.date ===
        formatISO(date, { ...dateOptions, representation: 'date' }),
    )

    if (!dailyPoint || hourlyPoints.length === 0) {
      this.logger.error('No data for date', {
        date,
        openMeteoDaily,
        openMeteoHourly,
      })
      throw new Error('No data for date')
    }

    const tideData: TideInfo[] = easyTideData.tidalEventList
      .filter((event) => isEqual(utcDateStringToUtc(event.date), date))
      .map((event) => ({
        height: event.height,
        time: utcDateStringToFractionalUtc(event.dateTime),
        timestamp: event.dateTime,
        type: event.eventType === 0 ? 'high' : 'low',
      }))

    const lowTidePoints = tideData.filter((tide) => tide.type === 'low')
    if (lowTidePoints.length === 0) {
      // the source isn't providing any, so we need to interpolate them
      const highTidePoints = tideData.filter((tide) => tide.type === 'high')

      // these will be fractional times
      const potentialLowTides: number[] = []
      if (highTidePoints.length === 2) {
        // average the points
        potentialLowTides.push(calcMean(highTidePoints.map((ht) => ht.time)))
      }
      // either way, calculate 6 hours before the first and 6 hours after the last
      potentialLowTides.push(
        highTidePoints[0].time - 6,
        highTidePoints.at(-1)!.time + 6,
      )

      // now filter those for ones that are in the current day, and convert to real tide info
      const newLowTides: TideInfo[] = potentialLowTides
        .filter((lt) => lt >= 0 && lt < 24)
        .map((lt) => {
          return {
            height: 0,
            time: lt,
            timestamp: utcDateStringAddFractional(referenceDate, lt),
            type: 'low',
          }
        })
      this.logger.warn('Interpolated new low tide data', {
        highTides: highTidePoints,
        lowTides: newLowTides,
      })
      tideData.push(...newLowTides)
    }

    return {
      referenceDate,
      sunData: {
        sunRise: dailyPoint?.sunrise || '',
        sunSet: dailyPoint?.sunset || '',
      },
      tideData,
      weatherData: {
        points: hourlyPoints.map((point) => ({
          cloudCover: point.cloudCover,
          precipitation: point.precipitation,
          precipitationProbability: point.precipitationProbability,
          rain: point.rain,
          sunshineDuration: point.sunshineDuration,
          temperature: point.temperature,
          timestamp: point.timestamp,
          uvIndex: point.uvIndex,
        })),
      },
      windData: {
        points: hourlyPoints.map((point) => ({
          direction: point.windDirection,
          gustSpeed: point.windGusts,
          speed: point.windSpeed,
          timestamp: point.timestamp,
        })),
        dominantDirection: dailyPoint?.windDirectionDominant,
        dominantSpeed: dailyPoint?.windSpeedMax,
        dominantGustSpeed: dailyPoint?.windGustsMax,
      },
    }
  }
}
