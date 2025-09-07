import { TimeSlot } from '@/lib/score/index'
import { IConstraintScorer } from '@/lib/types/interfaces'
import {
  TDayConstraint,
  TSunConstraint,
  TTideConstraint,
  TTimeConstraint,
  TWeatherConstraint,
  TWindConstraint,
} from '@/lib/types/TActivity'
import {
  naiveDateAddFractional,
  utcDateStringToFractionalUtc,
  utcDateStringToUtc,
} from '@/lib/utils/dates'
import { calcMean } from '@/lib/utils/math'
import { TZDate } from '@date-fns/tz'
import { endOfDay, isWeekend, isWithinInterval, startOfDay } from 'date-fns'

export class DefaultConstraintScorer implements IConstraintScorer {
  private readonly slotDate: TZDate
  constructor(private readonly slot: TimeSlot) {
    this.slot = slot
    this.slotDate = utcDateStringToUtc(slot.timestamp)
  }

  getDayScore(constraint: TDayConstraint): number {
    const scores = []

    const isWeekday = !isWeekend(this.slotDate)
    // these can be undefined | true | false, but we only care about being true,
    // so we don't need to check for the difference between false and undefined
    if (constraint.isWeekday) {
      scores.push(constraint.isWeekday === isWeekday ? 1 : 0)
    }

    if (constraint.isWeekend) {
      scores.push(constraint.isWeekend === !isWeekday ? 1 : 0)
    }

    if (constraint.dateRanges) {
      const isInRange = constraint.dateRanges.some(({ start, end }) => {
        const interval = {
          start: utcDateStringToUtc(start),
          end: utcDateStringToUtc(end),
        }
        return isWithinInterval(this.slotDate, interval)
      })

      scores.push(isInRange ? 1 : 0)
    }

    if (scores.length === 0) {
      return 1
    }

    return calcMean(scores)
  }

  getSunScore(constraint: TSunConstraint): number {
    const { sunRise, sunSet } = this.slot.sun
    const daylightInterval = {
      start: utcDateStringToUtc(sunRise),
      end: utcDateStringToUtc(sunSet),
    }

    const scores = []

    if (constraint.requiresDaylight) {
      const isDaylight = isWithinInterval(this.slotDate, daylightInterval)
      scores.push(isDaylight ? 1 : 0)
    }

    if (constraint.requiresDarkness) {
      const isDarkness = !isWithinInterval(this.slotDate, daylightInterval)
      scores.push(isDarkness ? 1 : 0)
    }

    if (constraint.maxHoursBeforeSunset !== undefined) {
      // if it is before sunset, we want to score 1.
      const fractionalSunset = utcDateStringToFractionalUtc(sunSet)

      // if diff is negative, this means it's before the target. if diff is positive, it's after the target
      // we want to allow a range of up to 1h post whichever time we're aiming for, where there's still some score.
      const diff =
        this.slot.fractionalHour -
        (fractionalSunset - constraint.maxHoursBeforeSunset)
      scores.push(expBackoffScore(diff, 1))
    }

    if (constraint.minHoursAfterSunrise !== undefined) {
      const fractionalSunrise = utcDateStringToFractionalUtc(sunRise)

      // we want the time to be after this
      const target = fractionalSunrise + constraint.minHoursAfterSunrise

      // if diff is negative, it's before the target, i.e. too early, so we need to invert this to use the helper
      const diff = this.slot.fractionalHour - target

      scores.push(expBackoffScore(-diff, 1))
    }

    // the constraint is empty, so it's a perfect score
    if (scores.length === 0) {
      return 1
    }

    return calcMean(scores)
  }

  getTideScore(constraint: TTideConstraint): number {
    const matchingTides = this.slot.tide.filter(
      ({ type }) => type === constraint.eventType,
    )

    // for each matching tide, find the tidal interval (default to start and end of day if unset). then check:
    // if the current time is within that interval; the height is within the range.
    // for height checks, decay the score as it gets further away
    const dayStart = startOfDay(this.slotDate)
    const dayEnd = endOfDay(this.slotDate)

    const scores = matchingTides.map(({ height, time }) => {
      const interval = {
        start:
          constraint.maxHoursBefore === undefined
            ? dayStart
            : naiveDateAddFractional(
                dayStart,
                time - constraint.maxHoursBefore,
              ),
        end:
          constraint.maxHoursAfter === undefined
            ? dayEnd
            : naiveDateAddFractional(dayStart, time + constraint.maxHoursAfter),
      }

      const internalScores = [isWithinInterval(this.slotDate, interval) ? 1 : 0]

      if (constraint.minHeight !== undefined) {
        const diff = constraint.minHeight - height
        // if diff is negative, we've met the minimum height. if it's positive, it's the height away from the requirement
        // e.g. minHeight = 1.5. height = 1. diff = 0.5. so to rank this, we need to look at diff relative the height we
        // wanted.
        internalScores.push(expBackoffScore(diff, constraint.minHeight))
      }

      if (constraint.maxHeight !== undefined) {
        const diff = height - constraint.maxHeight
        internalScores.push(expBackoffScore(diff, constraint.maxHeight))
      }

      return calcMean(internalScores)
    })

    return calcMean(scores)
  }

  getTimeScore(constraint: TTimeConstraint): number {
    // for hour comparisons, we can have up to an hour past whatever the target was, and still get some score.
    const scores = []
    if (constraint.earliestHour !== undefined) {
      // it's 7 and the earliest is 9. so diff = -2. so invert to make this bad.
      const diff = this.slot.fractionalHour - constraint.earliestHour
      scores.push(expBackoffScore(-diff, 1))
    }

    if (constraint.latestHour !== undefined) {
      // it's 3, and the latest is 5, so diff is -2.
      const diff = this.slot.fractionalHour - constraint.latestHour
      scores.push(expBackoffScore(diff, 1))
    }

    if (constraint.preferredHours !== undefined) {
      // each preferred hour is a block of 1h. we just need to check if the slot is in one of those blocks
      const isPreferred = constraint.preferredHours.some(
        (p) =>
          p <= this.slot.fractionalHour && this.slot.fractionalHour <= p + 1,
      )
      scores.push(isPreferred ? 1 : 0)
    }

    if (scores.length === 0) {
      return 1
    }
    return calcMean(scores)
  }

  getWeatherScore(constraint: TWeatherConstraint): number {
    const scores = []

    const { cloudCover, temperature, precipitationProbability, uvIndex } =
      this.slot.weather

    if (constraint.maxCloudCover !== undefined) {
      scores.push(
        expBackoffScore(
          cloudCover - constraint.maxCloudCover,
          constraint.maxCloudCover,
        ),
      )
    }

    if (constraint.maxTemperature !== undefined) {
      // can be up to 5ºC hotter and still score
      scores.push(expBackoffScore(temperature - constraint.maxTemperature, 5))
    }

    if (constraint.minTemperature !== undefined) {
      // can be up to 5ºC colder and still score
      scores.push(expBackoffScore(constraint.minTemperature - temperature, 5))
    }

    if (constraint.maxUvIndex !== undefined && uvIndex !== undefined) {
      // uvIndex is sensitive to value change, so up to 1 index over can still score
      scores.push(expBackoffScore(uvIndex - constraint.maxUvIndex, 1))
    }

    if (
      constraint.maxPrecipitationProbability !== undefined &&
      precipitationProbability !== undefined
    ) {
      scores.push(
        expBackoffScore(
          precipitationProbability - constraint.maxPrecipitationProbability,
          constraint.maxPrecipitationProbability,
        ),
      )
    }

    if (scores.length === 0) {
      return 1
    }
    return calcMean(scores)
  }

  getWindScore(constraint: TWindConstraint): number {
    const scores = []
    const { speed, gustSpeed, direction } = this.slot.wind

    if (constraint.maxGustSpeed !== undefined) {
      scores.push(
        expBackoffScore(
          gustSpeed - constraint.maxGustSpeed,
          constraint.maxGustSpeed,
        ),
      )
    }

    if (constraint.minSpeed !== undefined) {
      scores.push(expBackoffScore(constraint.minSpeed - speed, 2))
    }

    if (constraint.maxSpeed !== undefined) {
      scores.push(
        expBackoffScore(speed - constraint.maxSpeed, constraint.maxSpeed),
      )
    }

    if (constraint.preferredDirections !== undefined) {
      const directionTolerance = constraint.directionTolerance || 10

      // TODO: future work - calculate backoff for directions that are over or under by a little bit
      const isPreferred = constraint.preferredDirections.some(
        (p) =>
          p - directionTolerance <= directionTolerance &&
          direction <= p + directionTolerance,
      )

      scores.push(isPreferred ? 1 : 0)
    }

    if (scores.length === 0) {
      return 1
    }
    return calcMean(scores)
  }
}

function expBackoffScore(diff: number, range: number): number {
  /**
   * If diff is 0 or negative, return 1.
   * If diff is positive, tend towards 0 exponentially.
   * If diff >= range, return 0
   *
   * We can use this for scores comparing a fixed value to a continuous range (like time or height)
   */
  if (diff <= 0) {
    return 1
  }
  if (diff >= range) {
    return 0
  }

  const cutoff = 0.05 // making this smaller makes the dropoff steeper
  // this is how far through the range we are. e.g. diff=0.5h and range is 3h, so we're 1/6 of the way through the range
  // so we want 1/6th of the way through whichever curve function we choose
  const ratio = diff / range

  return Math.pow(cutoff, ratio)
}
