import { apiHookFactory } from '@/hooks/apiRequests'
import { defaultWorkingHours, WorkingHoursSetting } from '@/lib/types/settings'

const settingFactory = <SettingValueType>() => {
  return apiHookFactory<
    SettingValueType,
    { settingName: string; userId: string }
  >({
    fetchEndpointInfo: {
      endpoint: (params) =>
        `/api/settings?name=${(params || {}).settingName}&userId=${(params || {}).userId}`,
      getBody: (body: any) => body.value,
      dependencies: (params) => (params ? [params.settingName] : []),
    },
    updateEndpointInfo: {
      endpoint: () => '/api/settings',
      makeBody: (arg, params) => ({
        name: (params || {}).settingName,
        value: arg,
        userId: (params || {}).userId,
      }),
    },
  })
}

export const useWorkingHours = (userId: string) =>
  settingFactory<WorkingHoursSetting>()(defaultWorkingHours, {
    settingName: 'working_hours',
    userId,
  })
