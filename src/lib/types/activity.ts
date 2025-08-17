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
  type: 'weather'
}

export type TideConstraint = {
  maxHeight?: number
  minHeight?: number
  preferredStates?: ('high' | 'low' | 'rising' | 'falling')[]
  timeFromTideEvent?: {
    event: 'high' | 'low'
    maxHoursAfter?: number
    maxHoursBefore?: number
  }
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

export type Constraint =
  | WindConstraint
  | WeatherConstraint
  | TideConstraint
  | SunConstraint
  | TimeConstraint

export type Activity = {
  constraints: Constraint[]
  description: string
  id: string
  name: string
  priority: number // 1-10, higher is more important
  scope: 'global' | 'user'
}

export type ActivityScore<DebugType = never> = {
  activity: Activity
  constraintScores: { [constraintType: string]: number }
  debug?: DebugType
  feasible: boolean
  score: number
  timestamp: string
}
