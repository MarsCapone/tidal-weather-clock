import { apiHookFactory } from '@/hooks/apiRequests'

const settingFactory = <SettingValueType>() => {
  return apiHookFactory<SettingValueType, { settingName: string }>({
    fetchEndpointInfo: {
      method: 'GET',
      endpoint: ({ settingName }) => `/api/settings?name=${settingName}`,
      getBody: (body: any) => body.value,
      dependencies: ({ settingName }) => [settingName],
    },
    updateEndpointInfo: {
      method: 'PUT',
      endpoint: () => '/api/settings',
      makeBody: (arg, params) => ({
        name: params.settingName,
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
