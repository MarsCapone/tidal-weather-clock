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
