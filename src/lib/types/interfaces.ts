import {
  Activity,
  ActivityScore,
  DayConstraint,
  SunConstraint,
  TideConstraint,
  TimeConstraint,
  WeatherConstraint,
  WindConstraint,
} from '@/lib/types/activity'
import { DataContext } from '@/lib/types/context'

export type GetCacheOptions = {
  expiryHours: number
}

export interface ICache<T> {
  getCacheValue(key: string, options?: GetCacheOptions): T | null

  setCacheValue(key: string, value: T): void
}

export type LogFn<T extends Record<string, unknown> = Record<string, unknown>> =
  (message: string, context?: T) => void
type LoggerMaker = (context: Record<string, unknown>) => ILogger

export interface ILogger {
  debug: LogFn
  error: LogFn
  info: LogFn
  makeNew: LoggerMaker
  warn: LogFn
}

export interface IDataContextFetcher {
  // get the data context for the specific date
  getDataContext(date: Date): Promise<DataContext | null>

  // starting at `date` return as may data contexts as can be found
  getDataContexts(date: Date): Promise<DataContext[]>

  isCacheable(): boolean
}

export interface IActivityRecommender<DebugType = never> {
  // Finds the best feasible activity for a specific hour
  getBestActivityForTime(
    activities: [],
    targetHour: number,
  ): ActivityScore<DebugType> | null

  // Returns all activity-time combinations ranked by score
  getRecommendedActivities(activities: Activity[]): ActivityScore<DebugType>[]
}

export interface IActivityFetcher {
  getActivities(userId: string | undefined): Promise<Activity[]>

  setActivities(
    userId: string | undefined,
    activities: Activity[],
  ): Promise<void>
}

export interface IConstraintScorer {
  getDayScore(constraint: DayConstraint): number
  getSunScore(constraint: SunConstraint): number
  getTideScore(constraint: TideConstraint): number
  getTimeScore(constraint: TimeConstraint): number
  getWeatherScore(constraint: WeatherConstraint): number
  getWindScore(constraint: WindConstraint): number
}
