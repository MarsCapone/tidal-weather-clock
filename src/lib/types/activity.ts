import {
  SunData,
  TideData,
  TideType,
  WeatherInfo,
  WindInfo,
} from '@/lib/types/context'

export type WindConstraint = {
  directionTolerance?: number // tolerance in degrees for preferred directions
  maxGustSpeed?: number // these will be meters per second
  maxSpeed?: number
  minSpeed?: number
  preferredDirections?: number[] // array of preferred wind directions in degrees
  type: 'wind'
}

export type WeatherConstraint = {
  maxCloudCover?: number
  maxTemperature?: number
  minTemperature?: number
  maxUvIndex?: number
  maxPrecipitationProbability?: number
  type: 'weather'
}

export type TideConstraint = {
  eventType: TideType
  maxHeight?: number
  minHeight?: number
  maxHoursAfter?: number
  maxHoursBefore?: number
  type: 'tide'
}

export type SunConstraint = {
  maxHoursBeforeSunset?: number
  minHoursAfterSunrise?: number
  requiresDarkness?: boolean
  requiresDaylight?: boolean
  type: 'sun'
}

export type TimeConstraint = {
  earliestHour?: number // 24hr format
  latestHour?: number
  preferredHours?: number[]
  type: 'time'
}

export type DayConstraint = {
  isWeekday?: boolean
  isWeekend?: boolean
  dateRanges?: { start: string; end: string }[]
  type: 'day'
}

export type Constraint =
  | WindConstraint
  | WeatherConstraint
  | TideConstraint
  | SunConstraint
  | TimeConstraint
  | DayConstraint

export type Activity = {
  constraints: Constraint[]
  description: string
  id: string
  name: string
  priority: number // 1-10, higher is more important
  scope: 'global' | 'user'
  version?: number
}

export type TimeSlot = {
  timestamp: string
  fractionalHour: number

  wind: WindInfo
  weather: WeatherInfo
  sun: SunData
  tide: TideData
}
