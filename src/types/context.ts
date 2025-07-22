export type TideType = 'high' | 'low'

type Timestamp = {
  timestamp: string
}

export type TideInfo = {
  height: number
  time: number
  type: TideType
}

export type SunData = {
  sunRise: string
  sunSet: string
}

export type WeatherInfo = {
  cloudCover: number
  summary?: string
  temperature: number
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
export type WindDataPoints = TimeBasedDataPoints<WindInfo>

export type DataContext = {
  referenceDate: string
  sunData: SunData
  tideData: TideInfo[]
  weatherData: WeatherDataPoints
  windData: WindDataPoints
}
