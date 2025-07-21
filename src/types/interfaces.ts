import { DataContext } from '@/types/data'

export type GetCacheOptions = {
  expiryHours: number
}

export interface ICache {
  setCacheValue<T>(key: string, value: T): void

  getCacheValue<T>(key: string, options?: GetCacheOptions): T | null
}

export type LogFn<T extends Record<string, any> = Record<string, any>> = (
  message: string,
  context?: T,
) => void
type LoggerMaker = (context: Record<string, any>) => ILogger

export interface ILogger {
  info: LogFn
  warn: LogFn
  error: LogFn
  debug: LogFn
  makeNew: LoggerMaker
}

export interface IDataContextFetcher {
  isCacheable(): boolean

  // starting at `date` return as may data contexts as can be found
  getDataContexts(date: Date): Promise<DataContext[]>
}
