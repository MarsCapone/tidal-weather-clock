import { DataContext } from '@/types/context'
import { Activity, ActivityScore } from '@/types/activity'

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
