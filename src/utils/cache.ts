import { differenceInHours, formatISO, parseISO } from 'date-fns'
import CONSTANTS from '@/ui/constants'
import { ConsoleLogger } from '@/ui/logger'

export type GetCacheOptions = {
  expiryHours: number
}

export interface ICache {
  setCacheValue<T>(key: string, value: T): void
  getCacheValue<T>(key: string, options?: GetCacheOptions): T | null
}

export class LocalStorageCache implements ICache {
  private readonly logger: ConsoleLogger
  constructor() {
    this.logger = new ConsoleLogger()
  }
  setCacheValue<T>(key: string, value: T): void {
    const content = {
      timestamp: formatISO(new Date()),
      value,
    }
    this.logger.debug('setting cache value (internal)', { key, value })
    localStorage.setItem(key, JSON.stringify(content))
  }

  getCacheValue<T>(key: string, options?: GetCacheOptions): T | null {
    const content = localStorage.getItem(key)
    if (!content) {
      this.logger.debug('no cache content found (internal)', { key, content })
      return null
    }
    const cachedContent = JSON.parse(content)

    if (
      options !== undefined &&
      differenceInHours(parseISO(cachedContent.timestamp), new Date()) >
        options.expiryHours
    ) {
      this.logger.debug('cache content expired (internal)', {
        key,
        cachedContent,
      })
      return null
    }

    this.logger.debug('cache content found (internal)', { key, cachedContent })
    return cachedContent.value as T
  }
}
