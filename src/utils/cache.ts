'use client'

import { ConsoleLogger } from '@/utils/logger'
import { differenceInHours, formatISO, parseISO } from 'date-fns'
import { GetCacheOptions, ICache } from '../types/interfaces'

type CacheValue<T> = {
  timestamp: string
  value: T
}

export class LocalStorageCache<T> implements ICache<T> {
  private readonly logger: ConsoleLogger
  constructor() {
    this.logger = new ConsoleLogger()
  }
  setCacheValue(key: string, value: T): void {
    const content = {
      timestamp: formatISO(new Date()),
      value,
    }
    this.logger.debug('setting cache value (internal)', { key, value })
    localStorage.setItem(key, JSON.stringify(content))
  }

  getCacheValue(key: string, options?: GetCacheOptions): T | null {
    const content = localStorage.getItem(key)
    if (!content) {
      this.logger.debug('no cache content found (internal)', { content, key })
      return null
    }
    const cachedContent: CacheValue<T> = JSON.parse(content)

    if (
      options !== undefined &&
      differenceInHours(new Date(), parseISO(cachedContent.timestamp)) >
        options.expiryHours
    ) {
      this.logger.debug('cache content expired (internal)', {
        cachedContent,
        key,
      })
      localStorage.removeItem(key)
      return null
    }

    this.logger.debug('cache content found (internal)', {
      cacheAgeHours: differenceInHours(
        new Date(),
        parseISO(cachedContent.timestamp),
      ),
      cachedContent,
      key,
    })
    return cachedContent.value as T
  }
}
