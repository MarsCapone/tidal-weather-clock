export type TideType = 'high' | 'low'
export type CardinalDirection =
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW'

type Timestamp = {
  timestamp: Date
}

export type TideInfo = {
  height: number
  type: TideType
  time: number
}

export type SunData = {
  sunRise: Date | string | null
  sunSet: Date | string | null
}

type WeatherInfo = {
  cloudCover: number
  summary?: string
  temperature: number
} & Timestamp

type WindInfo = {
  direction: number
  speed: number
  gustSpeed: number
} & Timestamp

type TimeBasedDataPoints<T extends Timestamp> = {
  points: T[]
}

export type WeatherDataPoints = TimeBasedDataPoints<WeatherInfo>
export type WindDataPoints = TimeBasedDataPoints<WindInfo>

export type DataContext = {
  referenceDate: Date
  sunData: SunData
  tideData: TideInfo[]
  weatherData: WeatherDataPoints
  windData: WindDataPoints
}
