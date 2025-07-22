import logger from '@/backend/utils/pinoLogger'
import { differenceInDays } from 'date-fns'
import { GetCacheOptions, ICache } from '@/types/interfaces'

type CacheValue<T> = {
  timestamp: string
  value: T
}

export class DebugMemoryCache<T> implements ICache<T> {
  private cache: Record<string, CacheValue<T>> = {}

  setCacheValue(key: string, value: T): void {
    logger.info('setting cache value', { key, value })
    this.cache[key] = {
      timestamp: new Date().toISOString(),
      value,
    }
  }

  getCacheValue(key: string, options?: GetCacheOptions): T | null {
    const cachedContent: CacheValue<T> = this.cache[key]
    if (!cachedContent) {
      logger.warn('failed to get cache value', { key, reason: 'not found' })
      return null
    }

    const diff = differenceInDays(cachedContent.timestamp, new Date())
    if (options !== undefined && diff > options.expiryHours) {
      logger.warn('failed to get cache value', {
        diff,
        expiryHours: options.expiryHours,
        key,
        reason: 'expired',
      })
      return null
    }

    logger.info('getting cache value', { key })
    return cachedContent.value as T
  }
}
