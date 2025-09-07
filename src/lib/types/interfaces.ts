import { DataContext } from '@/lib/types/context'
import {
  TActivity,
  TDayConstraint,
  TSunConstraint,
  TTideConstraint,
  TTimeConstraint,
  TWeatherConstraint,
  TWindConstraint,
} from '@/lib/types/TActivity'

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

export interface IActivityFetcher {
  getActivities(userId: string | undefined): Promise<TActivity[]>

  setActivities(
    userId: string | undefined,
    activities: TActivity[],
  ): Promise<void>
}

export interface IConstraintScorer {
  getDayScore(constraint: TDayConstraint): number
  getSunScore(constraint: TSunConstraint): number
  getTideScore(constraint: TTideConstraint): number
  getTimeScore(constraint: TTimeConstraint): number
  getWeatherScore(constraint: TWeatherConstraint): number
  getWindScore(constraint: TWindConstraint): number
}
