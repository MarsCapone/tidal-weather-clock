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

type DateFnOptions = {
  tz: string
}

const defaultDateFnOptions: DateFnOptions = {
  tz: 'Europe/London',
}

export function formatTime(
  date: Date,
  options: DateFnOptions = defaultDateFnOptions,
): string {
  return utcDateToLocalTimeString(new TZDate(date), options)
}

export function formatInterval(
  interval: Interval<TZDate, TZDate>,
  addEndHours?: number,
  humanReadable = false,
  options: DateFnOptions = defaultDateFnOptions,
): string[] {
  let end = interval.end
  if (addEndHours) {
    end = addHours(end, addEndHours)
  }

  if (humanReadable) {
    const startingAt = formatRelative(
      interval.start.withTimeZone(options.tz),
      new TZDate().withTimeZone(options.tz),
    )
    const duration = formatDuration(
      intervalToDuration({
        start: interval.start,
        end,
      }),
    )

    return [`from ${startingAt}`, `for ${duration}`]
  }

  return [
    `${utcDateToLocalTimeString(interval.start, options)} - ${utcDateToLocalTimeString(end, options)}`,
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

export function naiveDateToFractionalLocal(
  d: Date,
  options: DateFnOptions = defaultDateFnOptions,
): number {
  const fractional = naiveDateToFractionalUtc(d)
  return fractional + tzOffsetHours(options)
}

export function utcDateStringToFractionalUtc(s: string): number {
  const date = parseISO(s, dateOptions)
  return naiveDateToFractionalUtc(date)
}

export function utcDateStringToLocalTimeString(
  s: string,
  options: DateFnOptions = defaultDateFnOptions,
): string {
  const date = utcDateStringToUtc(s)
  return utcDateToLocalTimeString(date, options)
}

export function fractionalUtcToLocalTimeString(
  fractionalTime: number | null,
  options: DateFnOptions = defaultDateFnOptions,
): string {
  if (fractionalTime === null) {
    return '00:00'
  }

  // this time is in UTC, but we need to convert it to the local time for display
  // result is minutes, so divide by 60 to get hours
  const timeZoneOffset = tzOffsetHours(options)

  const hours = Math.floor(fractionalTime) + timeZoneOffset
  const minutes = Math.floor((fractionalTime + timeZoneOffset - hours) * 60)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function utcDateToLocalTimeString(
  date: TZDate,
  options: DateFnOptions = defaultDateFnOptions,
): string {
  const localTime = date.withTimeZone(options.tz)
  return format(localTime, 'HH:mm')
}
export function localTimeStringToFractionalUtc(
  timeString: string,
  options: DateFnOptions = defaultDateFnOptions,
): number {
  // users will enter this data according to their experience of a day, but
  // we need to save it as UTC. so we need to work out what timezone we are
  // in, then subtract that diff from whichever numbers are given

  const [hours, minutes] = timeString.split(':')
  const fractionalTime = Number.parseInt(hours) + Number.parseInt(minutes) / 60

  // this should return the minutes ahead of UTC the current time is
  return fractionalTime - tzOffsetHours(options)
}

export function tzOffsetHours(
  options: DateFnOptions = defaultDateFnOptions,
): number {
  return tzOffset(options.tz, new Date()) / 60
}
