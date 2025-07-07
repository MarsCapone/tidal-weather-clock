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
  height: number
  type: TideType
} & Timestamp

type SunData = {
  sunRise: Date
  sunSet: Date
}

type WeatherInfo = {
  cloudCoverage?: number
  summary: string
  temperature: number
} & Timestamp

type WindInfo = {
  direction: CardinalDirection
  speed: number
} & Timestamp

type TimeBasedDataPoints<T extends Timestamp> = {
  points: T[]
}

export type TideDataPoints = TimeBasedDataPoints<TideInfo>
export type WeatherDataPoints = TimeBasedDataPoints<WeatherInfo>
export type WindDataPoints = TimeBasedDataPoints<WindInfo>

export type DataContext = {
  sunData?: SunData
  tideData?: TideDataPoints
  weatherData?: WeatherDataPoints
  windData?: WindDataPoints
}
