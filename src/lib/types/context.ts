import * as z from 'zod'

export const TideType = z.enum(['high', 'low'])

export type TTideType = z.infer<typeof TideType>

export type Timestamp = {
  timestamp: string
}

export type TideInfo = {
  height: number
  time: number
  type: TTideType
} & Timestamp

export type TideData = TideInfo[]

export type SunData = {
  sunRise: string
  sunSet: string
}

export type WeatherInfo = {
  cloudCover: number
  precipitation?: number
  precipitationProbability?: number
  rain?: number
  sunshineDuration?: number
  temperature: number
  uvIndex?: number
} & Timestamp

export type WindInfo = {
  direction: number
  gustSpeed: number
  speed: number
} & Timestamp

type TimeBasedDataPoints<T extends Timestamp> = {
  points: T[]
}

export type WeatherDataPoints = TimeBasedDataPoints<WeatherInfo>
export type WindDataPoints = TimeBasedDataPoints<WindInfo> & {
  dominantDirection?: number
  dominantSpeed?: number
  dominantGustSpeed?: number
}

export type DataContext = {
  referenceDate: string
  sunData: SunData
  tideData: TideData
  weatherData: WeatherDataPoints
  windData: WindDataPoints
}
