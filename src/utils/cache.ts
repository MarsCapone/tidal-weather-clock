import { differenceInHours, formatISO, parseISO } from 'date-fns'

export type CacheResponseOptions = {
  expiryHours?: number
}

export function cacheResponse<T>(key: string, response: T): void {
  const content = JSON.stringify({
    timestamp: formatISO(new Date()),
    response,
  })
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

  const expiryHours = options.expiryHours || 24
  if (
    differenceInHours(parseISO(cachedContent.timestamp), new Date()) >
    expiryHours
  ) {
    return null
  }
  return cachedContent.response as T
}
