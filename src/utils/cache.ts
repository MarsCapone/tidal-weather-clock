import { differenceInHours, formatISO, parseISO } from 'date-fns'
import CONSTANTS from '@/ui/constants'

export type CacheResponseOptions = {
  expiryHours?: number
}

export function setCachedResponse<T>(key: string, response: T): void {
  const content = {
    timestamp: formatISO(new Date()),
    response,
  }
  localStorage.setItem(key, JSON.stringify(content))
}

export function getCachedResponse<T>(
  key: string,
  options: CacheResponseOptions = {},
): T | null {
  const content = localStorage.getItem(key)
  if (!content) {
    return null
  }
  const cachedContent = JSON.parse(content)

  const expiryHours =
    options.expiryHours || CONSTANTS.DEFAULT_CACHE_EXPIRY_HOURS
  if (
    differenceInHours(parseISO(cachedContent.timestamp), new Date()) >
    expiryHours
  ) {
    return null
  }
  return cachedContent.response as T
}
