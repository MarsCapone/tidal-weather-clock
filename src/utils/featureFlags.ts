const defaultFeatureFlags = {
  showSuggestedActivity: false,
  alwaysShowActivityNextButton: false,
  useDemoActivities: true,
}

type FeatureFlagName = keyof typeof defaultFeatureFlags

type FeatureFlags = {
  [K in FeatureFlagName]: boolean
}

export function useFeatureFlags(): FeatureFlags {
  const keys = Object.keys(defaultFeatureFlags) as FeatureFlagName[]

  return Object.fromEntries(
    keys.map((flagName) => {
      const item = localStorage.getItem(`featureFlags/${flagName}`)
      if (item !== null) return [flagName, JSON.parse(item)]
      return [flagName, defaultFeatureFlags[flagName]]
    }),
  ) as FeatureFlags
}
