import { tz } from '@date-fns/tz'
import {
  addHours,
  addMinutes,
  format,
  formatDuration,
  formatRelative,
  Interval,
  intervalToDuration,
  parseISO,
  startOfDay,
} from 'date-fns'

export const dateOptions = {
  in: tz('+00:00'),
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm', dateOptions)
}

export function formatInterval(
  interval: Interval<Date, Date>,
  addEndHours?: number,
  humanReadable = false,
): string[] {
  let end = interval.end
  if (addEndHours) {
    end = addHours(end, addEndHours)
  }

  if (humanReadable) {
    const startingAt = formatRelative(interval.start, new Date())
    const duration = formatDuration(
      intervalToDuration({
        start: interval.start,
        end,
      }),
    )

    return [`from ${startingAt}`, `for ${duration}`]
  }

  return [`${formatTime(interval.start)} - ${formatTime(end)} UTC`]
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
