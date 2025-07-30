'use client'

import { DEFAULT_FEATURE_FLAGS } from '@/constants'
import logger from '@/utils/logger'
import { useGetCookie } from 'cookies-next'
import { useEffect, useState } from 'react'

type FeatureFlagName = keyof typeof DEFAULT_FEATURE_FLAGS

type UseFeatureFlags = {
  [K in FeatureFlagName]: boolean
}

export function useFeatureFlags(): UseFeatureFlags {
  const [featureFlags, setFeatureFlags] = useState<UseFeatureFlags>(
    DEFAULT_FEATURE_FLAGS,
  )

  const getCookie = useGetCookie()

  useEffect(() => {
    const flagsCookie = getCookie('featureFlags')
    if (!flagsCookie) {
      // If the cookie doesn't exist, we can assume the default feature flags
      setFeatureFlags(DEFAULT_FEATURE_FLAGS)
      return
    }

    const parsedFlags = JSON.parse(flagsCookie) as Partial<UseFeatureFlags>
    // Merge the parsed flags with the default feature flags
    const mergedFlags: UseFeatureFlags = {
      ...DEFAULT_FEATURE_FLAGS,
      ...parsedFlags,
    }
    logger.info('feature flags loaded', { mergedFlags })
    setFeatureFlags(mergedFlags)
  }, [getCookie])
  return featureFlags
}
