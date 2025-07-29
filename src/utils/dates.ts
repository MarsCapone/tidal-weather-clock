import {
  addHours,
  addMinutes,
  format,
  Interval,
  parseISO,
  startOfDay,
} from 'date-fns'

export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}

export function formatInterval(
  interval: Interval<Date, Date>,
  addEndHours?: number,
): string {
  let end = interval.end
  if (addEndHours) {
    end = addHours(end, addEndHours)
  }
  return `${formatTime(interval.start)} - ${formatTime(end)}`
}

export function withFractionalTime(date: Date | string, time: number): Date {
  if (typeof date === 'string') {
    date = parseISO(date)
  }
  const hours = Math.floor(time)
  const minutes = (time - hours) * 60
  return addHours(addMinutes(startOfDay(date), minutes), hours)
}

export function getFractionalTime(d: Date | string): number {
  if (typeof d === 'string') {
    d = parseISO(d)
  }
  const hours = d.getHours()
  const fractionalMinutes = d.getMinutes() / 60
  return hours + fractionalMinutes
}

export function fractionalTimeToString(
  time: number | undefined,
): string | undefined {
  if (time === undefined) {
    return undefined
  }
  const hours = Math.floor(time)
  const minutes = (time - hours) * 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
