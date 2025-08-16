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

export const defaultWorkingHours: WorkingHoursSetting = {
  startHour: 0,
  endHour: 0,
  enabled: false,
}

export const useWorkingHours = () =>
  settingFactory<WorkingHoursSetting>()(defaultWorkingHours, {
    settingName: 'working_hours',
  })

export function isInWorkingHours(
  workingHours: WorkingHoursSetting,
  value: number,
) {
  if (!workingHours.enabled) {
    // if working hours are not enable, effectively everything is in working hours
    return true
  }

  return workingHours.startHour <= value && workingHours.endHour > value
}
