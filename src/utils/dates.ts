import { tz, TZDate, tzOffset } from '@date-fns/tz'
import {
  addHours,
  format,
  formatDuration,
  formatISO,
  formatRelative,
  Interval,
  intervalToDuration,
  parseISO,
} from 'date-fns'

export const dateOptions = {
  in: tz('+00:00'),
}

export const dateOptionsUK = {
  in: tz('Europe/London'),
}

export function formatTime(date: Date): string {
  return utcDateToLocalTimeString(new TZDate(date))
}

export function formatInterval(
  interval: Interval<TZDate, TZDate>,
  addEndHours?: number,
  humanReadable = false,
): string[] {
  let end = interval.end
  if (addEndHours) {
    end = addHours(end, addEndHours)
  }

  if (humanReadable) {
    const startingAt = formatRelative(interval.start, new TZDate())
    const duration = formatDuration(
      intervalToDuration({
        start: interval.start,
        end,
      }),
    )

    return [`from ${startingAt}`, `for ${duration}`]
  }

  return [
    `${utcDateToLocalTimeString(interval.start)} - ${utcDateToLocalTimeString(end)}`,
  ]
}

export function naiveDateAddFractional(date: Date, fractional: number): Date {
  return addHours(date, fractional)
}

export function utcDateStringAddFractional(
  s: string,
  fractional: number,
): string {
  const date = parseISO(s, dateOptions)
  const newDate = naiveDateAddFractional(date, fractional)
  return formatISO(newDate, dateOptions)
}

export function utcDateStringToUtc(s: string): TZDate {
  return parseISO(s, dateOptions)
}

export function naiveDateToFractionalUtc(d: Date): number {
  const hours = d.getUTCHours()
  const minutes = d.getUTCMinutes()

  return hours + minutes / 60
}

export function naiveDateToFractionalLocal(d: Date): number {
  const fractional = naiveDateToFractionalUtc(d)
  return fractional + tzOffsetHours()
}

export function utcDateStringToFractionalUtc(s: string): number {
  const date = parseISO(s, dateOptions)
  return naiveDateToFractionalUtc(date)
}

export function utcDateStringToLocalTimeString(s: string): string {
  const fractional = utcDateStringToFractionalUtc(s)
  return fractionalUtcToLocalTimeString(fractional)
}

export const fractionalUtcToLocalTimeString = (
  fractionalTime: number | null,
): string => {
  if (fractionalTime === null) {
    return '00:00'
  }

  // this time is in UTC, but we need to convert it to the local time for display
  // result is minutes, so divide by 60 to get hours
  const timeZoneOffset = tzOffsetHours()

  const hours = Math.floor(fractionalTime) + timeZoneOffset
  const minutes = Math.floor((fractionalTime + timeZoneOffset - hours) * 60)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function utcDateToLocalTimeString(date: TZDate): string {
  const fractionalUtc = naiveDateToFractionalUtc(date)
  return fractionalUtcToLocalTimeString(fractionalUtc)
}
export const localTimeStringToFractionalUtc = (timeString: string) => {
  // users will enter this data according to their experience of a day, but
  // we need to save it as UTC. so we need to work out what timezone we are
  // in, then subtract that diff from whichever numbers are given

  const [hours, minutes] = timeString.split(':')
  const fractionalTime = Number.parseInt(hours) + Number.parseInt(minutes) / 60

  // this should return the minutes ahead of UTC the current time is
  return fractionalTime - tzOffsetHours()
}

export function tzOffsetHours(): number {
  return tzOffset('Europe/London', new Date()) / 60
}
