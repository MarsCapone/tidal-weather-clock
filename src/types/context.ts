export type TideType = 'high' | 'low'

export type Timestamp = {
  timestamp: string
}

export type TideInfo = {
  height: number
  time: number
  type: TideType
} & Partial<Timestamp>

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
  tideData: TideInfo[]
  weatherData: WeatherDataPoints
  windData: WindDataPoints
}
