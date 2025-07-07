import { addHours, addMinutes, format, startOfDay } from 'date-fns'
import { addWithOptions } from 'date-fns/fp'

export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}

export function withFractionalTime(date: Date, time: number): Date {
  const hours = Math.floor(time)
  const minutes = (time - hours) * 60
  return addHours(addMinutes(startOfDay(date), minutes), hours)
}

export function getFractionalTime(d: Date): number {
  const hours = d.getHours()
  const fractionalMinutes = d.getMinutes() / 60
  return hours + fractionalMinutes
}
