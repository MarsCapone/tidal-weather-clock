import { apiHookFactory } from '@/hooks/apiRequests'

const settingFactory = <SettingValueType>() => {
  return apiHookFactory<SettingValueType, { settingName: string }>({
    fetchEndpointInfo: {
      endpoint: (params) => `/api/settings?name=${(params || {}).settingName}`,
      getBody: (body: any) => body.value,
      dependencies: (params) => (params ? [params.settingName] : []),
    },
    updateEndpointInfo: {
      endpoint: () => '/api/settings',
      makeBody: (arg, params) => ({
        name: (params || {}).settingName,
        value: arg,
      }),
    },
  })
}

export type WorkingHoursSetting = {
  startHour: number
  endHour: number
  enabled: boolean
}

export const useWorkingHours = settingFactory<WorkingHoursSetting>()
