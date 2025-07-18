const defaultFeatureFlags = {
  showSuggestedActivity: false,
  alwaysShowActivityNextButton: false,
}

type FeatureFlagName = keyof typeof defaultFeatureFlags

type FeatureFlags = {
  [K in FeatureFlagName]: boolean
}

export function useFeatureFlags(): FeatureFlags {
  const keys = Object.keys(defaultFeatureFlags) as FeatureFlagName[]
  keys.forEach((flagName) => {
    const item = localStorage.getItem(`featureFlags/${flagName}`)
    if (item === null) {
      localStorage.setItem(
        `featureFlags/${flagName}`,
        JSON.stringify(defaultFeatureFlags[flagName]),
      )
    }
  })

  return Object.fromEntries(
    keys.map((flagName) => {
      const item = localStorage.getItem(`featureFlags/${flagName}`)
      if (item !== null) return [flagName, JSON.parse(item)]
      return [flagName, null]
    }),
  ) as FeatureFlags
}
