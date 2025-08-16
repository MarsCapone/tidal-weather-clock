import CONSTANTS from '@/constants'
import { capitalize } from '@/lib/utils/string'
import { usePathname } from 'next/navigation'

export default function useTitle(
  fallback: string | undefined = undefined,
): string | undefined {
  const path = usePathname()

  return getTitle(path, fallback)
}

export function getTitle(path: string, fallback: string | undefined) {
  if (path === '/') {
    return CONSTANTS.TITLE
  }

  if (path in CONSTANTS.PATH_TITLES) {
    return CONSTANTS.PATH_TITLES[path]
  }

  const lastPart = path.split('/').filter(Boolean).at(-1)
  if (lastPart && lastPart.length > 0) {
    return capitalize(lastPart)
  }

  return fallback
}
