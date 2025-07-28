'use client'

import { useEffect, useState } from 'react'

const defaultFeatureFlags = {
  showActivityTable: true,
  showSuggestedActivity: true,
}

type FeatureFlagName = keyof typeof defaultFeatureFlags

type UseFeatureFlags = {
  [K in FeatureFlagName]: boolean
}

export function useFeatureFlags(): UseFeatureFlags {
  const [featureFlags, setFeatureFlags] =
    useState<UseFeatureFlags>(defaultFeatureFlags)
  useEffect(() => {
    const keys = Object.keys(defaultFeatureFlags) as FeatureFlagName[]

    const ffs = Object.fromEntries(
      keys.map((flagName) => {
        const item = localStorage.getItem(`featureFlags/${flagName}`)
        if (item !== null) {
          return [flagName, JSON.parse(item)]
        }
        return [flagName, defaultFeatureFlags[flagName]]
      }),
    ) as UseFeatureFlags
    setFeatureFlags(ffs)
  }, [])
  return featureFlags
}
