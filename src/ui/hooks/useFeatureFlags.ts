const defaultFeatureFlags = {
  alwaysShowActivityNextButton: false,
  showSuggestedActivity: false,
  useDemoActivities: true,
  showActivityTable: false,
}

type FeatureFlagName = keyof typeof defaultFeatureFlags

type UseFeatureFlags = {
  [K in FeatureFlagName]: boolean
}

export function useFeatureFlags(): UseFeatureFlags {
  const keys = Object.keys(defaultFeatureFlags) as FeatureFlagName[]

  return Object.fromEntries(
    keys.map((flagName) => {
      const item = localStorage.getItem(`featureFlags/${flagName}`)
      if (item !== null) {
        return [flagName, JSON.parse(item)]
      }
      return [flagName, defaultFeatureFlags[flagName]]
    }),
  ) as UseFeatureFlags
}
