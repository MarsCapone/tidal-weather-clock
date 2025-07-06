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

type TideInfo = {
  type: TideType
  height: number
} & Timestamp

type SunData = {
  sunRise: Date
  sunSet: Date
}

type WeatherInfo = {
  summary: string
  temperature: number
  cloudCoverage?: number
} & Timestamp

type WindInfo = {
  speed: number
  direction: CardinalDirection
} & Timestamp

type TimeBasedDataPoints<T extends Timestamp> = {
  points: T[]
}

export type TideDataPoints = TimeBasedDataPoints<TideInfo>
export type WeatherDataPoints = TimeBasedDataPoints<WeatherInfo>
export type WindDataPoints = TimeBasedDataPoints<WindInfo>

export type DataContext = {
  tideData?: TideDataPoints
  weatherData?: WeatherDataPoints
  windData?: WindDataPoints
  sunData?: SunData
}
