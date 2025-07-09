import { differenceInHours, formatISO, parseISO } from 'date-fns'
import CONSTANTS from '@/ui/constants'

export type GetCacheOptions = {
  expiryHours: number
}

export interface ICache {
  setCacheValue<T>(key: string, value: T): void
  getCacheValue<T>(key: string, options?: GetCacheOptions): T | null
}

export class LocalStorageCache implements ICache {
  setCacheValue<T>(key: string, value: T): void {
    const content = {
      timestamp: formatISO(new Date()),
      value,
    }
    localStorage.setItem(key, JSON.stringify(content))
  }

  getCacheValue<T>(key: string, options?: GetCacheOptions): T | null {
    const content = localStorage.getItem(key)
    if (!content) {
      return null
    }
    const cachedContent = JSON.parse(content)

    if (
      options !== undefined &&
      differenceInHours(parseISO(cachedContent.timestamp), new Date()) >
        options.expiryHours
    ) {
      return null
    }

    return cachedContent.response as T
  }
}
