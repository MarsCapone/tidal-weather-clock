export type WorkingHoursSetting = {
  startHour: number
  endHour: number
  enabled: boolean
}
export const defaultWorkingHours: WorkingHoursSetting = {
  startHour: 8,
  endHour: 18,
  enabled: true,
}

export type LatLong = [number, number]
