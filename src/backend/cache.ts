import { GetCacheOptions, ICache } from '@/utils/cache'
import logger from '@/backend/logger'
import { differenceInDays } from 'date-fns'

type CacheValue<T> = {
  timestamp: string
  value: T
}

export class DebugMemoryCache implements ICache {
  private cache: Record<string, any> = {}

  setCacheValue<T>(key: string, value: T): void {
    logger.info('setting cache value', { key, value })
    this.cache[key] = {
      timestamp: new Date().toISOString(),
      value,
    }
  }

  getCacheValue<T>(key: string, options?: GetCacheOptions): T | null {
    const cachedContent: CacheValue<T> = this.cache[key]
    if (!cachedContent) {
      logger.warn('failed to get cache value', { key, reason: 'not found' })
      return null
    }

    const diff = differenceInDays(cachedContent.timestamp, new Date())
    if (options !== undefined && diff > options.expiryHours) {
      logger.warn('failed to get cache value', {
        key,
        reason: 'expired',
        diff,
        expiryHours: options.expiryHours,
      })
      return null
    }

    logger.info('getting cache value', { key })
    return cachedContent.value as T
  }
}
