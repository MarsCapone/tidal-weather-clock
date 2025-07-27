import logger from '@/app/api/pinoLogger'
import { GetCacheOptions, ICache } from '@/types/interfaces'
import { differenceInDays } from 'date-fns'

type CacheValue<T> = {
  timestamp: string
  value: T
}

class BaseCache<T> implements ICache<T> {
  getCachedContent(key: string): CacheValue<T> | undefined {
    return undefined
  }

  setCachedContent(key: string, value: CacheValue<T>): void {}
  getCacheValue(key: string, options?: GetCacheOptions): T | null {
    const cachedContent = this.getCachedContent(key)
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

  setCacheValue(key: string, value: T): void {
    logger.info('setting cache value', { key, value })
    this.setCachedContent(key, {
      timestamp: new Date().toISOString(),
      value,
    })
  }
}

export class DebugMemoryCache<T> extends BaseCache<T> {
  private cache: Record<string, CacheValue<T>> = {}

  getCachedContent(key: string): CacheValue<T> | undefined {
    return this.cache[key]
  }
  setCachedContent(key: string, value: CacheValue<T>): void {
    this.cache[key] = value
  }
}
