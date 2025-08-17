import { WorkingHoursSetting } from '@/lib/types/settings'

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
