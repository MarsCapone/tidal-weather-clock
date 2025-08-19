import {
  Activity,
  ActivityScore,
  Constraint,
  SunConstraint,
  TideConstraint,
  TimeConstraint,
  WeatherConstraint,
  WindConstraint,
} from '@/lib/types/activity'
import {
  DataContext,
  TideInfo,
  WeatherInfo,
  WindInfo,
} from '@/lib/types/context'
import { IActivityRecommender } from '@/lib/types/interfaces'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import logger from '@/lib/utils/logger'
import { calcMean } from '@/lib/utils/math'
import { TZDate } from '@date-fns/tz'
import {
  differenceInHours,
  eachHourOfInterval,
  endOfDay,
  formatISO,
  Interval,
  isEqual,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns'
import { WorkingHoursSetting } from '@/lib/types/settings'

type TimeSlot = {
  hour: number
  isDaylight: boolean
  tideState: {
    current: TideInfo | null
    height: number
    next: TideInfo | null
    state: 'rising' | 'falling' | 'high' | 'low'
  }
  timestamp: string
  weather: WeatherInfo
  wind: WindInfo
}

export type ActivityGroupInfo = {
  constraintScores: ActivityScore['constraintScores']
  interval: Interval<TZDate, TZDate>
  score: ActivityScore['score']
  slot: TimeSlot | undefined
}

export type DefaultActivityScore = ActivityScore<{ slot: TimeSlot }>

export type EnrichedActivityScore = DefaultActivityScore & {
  interval: Interval<TZDate, TZDate>
  intervals?: ActivityGroupInfo[]
}
export function groupScores(
  scores: DefaultActivityScore[],
  groupByType: 'none' | 'time' | 'timeAndActivity',
): EnrichedActivityScore[] {
  /* Group an ordered list of scores into a list of scores that have an interval
   * instead of a timestamp. Neighbouring scores should be grouped together if
   * difference in time is at most 1 hour, and the activity and score is the
   * same.
   */

  if (groupByType === 'none') {
    return scores.map((score) => {
      const start = utcDateStringToUtc(score.timestamp)
      const interval = { end: start, start }
      return { ...score, interval }
    })
  }

  const scoresByTime = scores
    .reduce(
      (acc: DefaultActivityScore[][], currentValue: DefaultActivityScore) => {
        const [head, ...rest] = acc
        if (head === undefined || head.length === 0) {
          // starting a new group
          return [[currentValue], ...acc]
        }

        const prevScore = head.at(-1)!
        if (
          prevScore.activity.id !== currentValue.activity.id ||
          prevScore.score !== currentValue.score
        ) {
          // the activity has changed, so we should start a new group
          return [[currentValue], ...acc]
        }

        const currentTime = utcDateStringToUtc(currentValue.timestamp)
        const prevTime = utcDateStringToUtc(head.at(-1)!.timestamp)

        if (differenceInHours(currentTime, prevTime) !== 1) {
          return [[currentValue], ...acc]
        }

        // consecutive activity of the same type and score, so we want to extend the group
        return [[...head, currentValue], ...rest]
      },
      [],
    )
    .reverse()
    .map((group: DefaultActivityScore[]) => {
      const interval = {
        end: utcDateStringToUtc(group.at(-1)!.timestamp),
        start: utcDateStringToUtc(group[0].timestamp),
      }
      return {
        ...group[0],
        interval,
      }
    })

  if (groupByType === 'time') {
    return scoresByTime
  }

  // otherwise we need to group again by activity.
  // go through the new list and merge consecutive activities with the same id
  return scoresByTime
    .reduce(
      (
        acc: EnrichedActivityScore[][],
        currentValue: EnrichedActivityScore,
      ): EnrichedActivityScore[][] => {
        const [head, ...rest] = acc

        if (head === undefined || head.length === 0) {
          return [[currentValue], ...acc]
        }

        const prev = head.at(-1)!
        if (prev.activity.id !== currentValue.activity.id) {
          return [[currentValue], ...acc]
        }

        return [[...head, currentValue], ...rest]
      },
      [],
    )
    .reverse()
    .map((group: EnrichedActivityScore[]) => {
      return {
        ...group[0],
        interval: {
          end: group.at(-1)!.interval.end,
          start: group[0].interval.start,
        },
        intervals: group.map((score) => ({
          constraintScores: score.constraintScores,
          interval: score.interval,
          score: score.score,
          slot: score.debug?.slot,
        })),
      }
    })
}

export class ActivityRecommender
  implements IActivityRecommender<{ slot: TimeSlot }>
{
  private slots: TimeSlot[]

  constructor(context: DataContext, workingHours: WorkingHoursSetting) {
    if (context === undefined) {
      logger.warn('cannot suggest activity because data context is undefined')
      this.slots = []
    } else {
      this.slots = generateTimeSlots(context, workingHours)
    }
  }

  scoreConstraint(constraint: Constraint, slot: TimeSlot): number {
    switch (constraint.type) {
      case 'time':
        return scoreTimeConstraint(constraint, slot)
      case 'sun':
        return scoreSunConstraint(constraint, slot)
      case 'tide':
        return scoreTideConstraint(constraint, slot)
      case 'weather':
        return scoreWeatherConstraint(constraint, slot)
      case 'wind':
        return scoreWindConstraint(constraint, slot)
      default:
        return 0.5 // middle score
    }
  }

  getBestActivityForTime(
    activities: [],
    targetHour: number,
  ): ActivityScore<{ slot: TimeSlot }> | null {
    const slot = this.slots.find((s) => s.hour === targetHour)
    if (!slot) {
      return null
    }

    const recommendations = this.getRecommendedActivities(activities)
    const timeSpecificRecs = recommendations.filter((r) => {
      const recHour = parseISO(r.timestamp).getHours()
      return recHour === targetHour && r.feasible
    })

    return timeSpecificRecs.length > 0 ? timeSpecificRecs[0] : null
  }

  getRecommendedActivities(
    activities: Activity[],
  ): ActivityScore<{ slot: TimeSlot }>[] {
    const recommendations: ActivityScore<{ slot: TimeSlot }>[] = []

    activities.forEach((activity) => {
      this.slots.forEach((slot) => {
        const constraintScores: { [key: string]: number } = {}
        let totalScore = 0
        let feasible = true

        activity.constraints.forEach((constraint, index) => {
          const score = this.scoreConstraint(constraint, slot)
          constraintScores[`${activity.id}:${index}:${constraint.type}`] = score
          totalScore += score

          // if any one score is 0, then the activity is infeasible at this time
          if (score === 0) {
            feasible = false
          }
        })
        constraintScores[`${activity.id}:+:priority`] = activity.priority / 10

        const averageScore = calcMean(Object.values(constraintScores))
        const finalScore = Math.min(1, averageScore)

        recommendations.push({
          activity,
          constraintScores,
          debug: {
            slot,
          },
          feasible,
          score: finalScore,
          timestamp: slot.timestamp,
        })
      })
    })

    return recommendations.sort((a, b) => b.score - a.score)
  }
}

function generateTimeSlots(
  dc: DataContext,
  workingHours: WorkingHoursSetting,
): TimeSlot[] {
  const refDate = startOfDay(parseISO(dc.referenceDate, dateOptions))

  const timeSlots = eachHourOfInterval({
    end: endOfDay(refDate),
    start: refDate,
  }).filter((date) => {
    if (workingHours === null || !workingHours.enabled) {
      // don't filter at all
      return true
    }

    // this date is in UTC and working hours are also UTC, but in fractionalTime
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const fractionalTime = hours + minutes / 60

    // filter for only within the given times
    return (
      fractionalTime >= workingHours.startHour &&
      fractionalTime <= workingHours.endHour
    )
  })

  return timeSlots
    .map((slot) => {
      // find corresponding wind and weather data
      const wind = dc.windData.points.find((p) =>
        isEqual(parseISO(p.timestamp), slot),
      )
      const weather = dc.weatherData.points.find((p) =>
        isEqual(parseISO(p.timestamp), slot),
      )

      // TODO: what should we do if we don't have these?
      if (wind && weather) {
        const isDaylight = isWithinInterval(slot, {
          end: parseISO(dc.sunData.sunSet),
          start: parseISO(dc.sunData.sunRise),
        })
        const hour = differenceInHours(slot, refDate)
        const tideState = calculateTideState(dc.tideData, hour)
        return {
          hour,
          isDaylight,
          tideState,
          timestamp: formatISO(slot),
          weather,
          wind,
        } as TimeSlot
      }
      return null
    })
    .filter((v) => v !== null)
}

function calculateTideState(
  tideData: TideInfo[],
  hour: number,
): TimeSlot['tideState'] {
  const tides = [...tideData].sort((a, b) => a.time - b.time)

  let current: TideInfo | null = null
  let next: TideInfo | null = null

  for (let i = 0; i < tides.length; i++) {
    if (tides[i].time <= hour) {
      current = tides[i]
      next = tides[i + 1] || null
    } else {
      next = tides[i]
      break
    }
  }

  let state: 'rising' | 'falling' | 'high' | 'low' = 'rising'
  let height = 0

  if (current && next) {
    // Interpolate tide height
    const timeDiff = next.time - current.time
    const hoursSinceCurrent = hour - current.time
    const ratio = hoursSinceCurrent / timeDiff
    height = current.height + (next.height - current.height) * ratio

    // Determine state
    if (Math.abs(hoursSinceCurrent) < 0.5) {
      state = current.type
    } else if (Math.abs(hour - next.time) < 0.5) {
      state = next.type
    } else {
      state = current.type === 'high' ? 'falling' : 'rising'
    }
  }

  return { current, height, next, state }
}

// constraint score functions

function scoreWindConstraint(
  constraint: WindConstraint,
  slot: TimeSlot,
): number {
  const { wind } = slot

  if (constraint.minSpeed && wind.speed < constraint.minSpeed) {
    return 0
  }
  if (constraint.maxSpeed && wind.speed > constraint.maxSpeed) {
    return 0
  }
  if (constraint.maxGustSpeed && wind.speed > constraint.maxGustSpeed) {
    return 0
  }

  const directionTolerance = constraint.directionTolerance || 0
  if (constraint.preferredDirections) {
    const isDirectionGood = constraint.preferredDirections.some((direction) => {
      const diff = Math.abs(wind.direction - direction)
      return diff <= directionTolerance || diff >= 360 - directionTolerance
    })
    if (!isDirectionGood) {
      return 0.5
    }
  }
  return 1
}

function scoreWeatherConstraint(
  constraint: WeatherConstraint,
  slot: TimeSlot,
): number {
  const { weather } = slot

  if (
    constraint.minTemperature &&
    weather.temperature < constraint.minTemperature
  ) {
    return 0
  }
  if (
    constraint.maxTemperature &&
    weather.temperature > constraint.maxTemperature
  ) {
    return 0
  }

  if (
    constraint.maxCloudCover &&
    weather.cloudCover > constraint.maxCloudCover
  ) {
    // max is 10, we have 90, so this is bad. diff is 80 => 0.8, so the score
    // is 0.2
    return 1 - (weather.cloudCover - constraint.maxCloudCover) / 100
  }
  return 1
}

function scoreTideConstraint(
  constraint: TideConstraint,
  slot: TimeSlot,
): number {
  const { tideState } = slot

  if (constraint.minHeight && tideState.height < constraint.minHeight) {
    return 0
  }
  if (constraint.maxHeight && tideState.height > constraint.maxHeight) {
    return 0
  }

  let score = 1

  if (constraint.timeFromTideEvent && tideState.current) {
    const hoursSinceTide = slot.hour - tideState.current.time
    const {
      event,
      maxHoursAfter = 2,
      maxHoursBefore = 2,
    } = constraint.timeFromTideEvent

    if (tideState.current.type === event) {
      if (hoursSinceTide < -maxHoursBefore || hoursSinceTide > maxHoursAfter) {
        score *= 0.5
      }
    }
  }
  return score
}

function scoreSunConstraint(constraint: SunConstraint, slot: TimeSlot): number {
  if (constraint.requiresDaylight && !slot.isDaylight) {
    return 0
  }
  if (constraint.requiresDarkness && slot.isDaylight) {
    return 0
  }
  return 1
}

function scoreTimeConstraint(
  constraint: TimeConstraint,
  slot: TimeSlot,
): number {
  if (constraint.earliestHour && slot.hour < constraint.earliestHour) {
    return 0
  }
  if (constraint.latestHour && slot.hour > constraint.latestHour) {
    return 0
  }

  if (
    constraint.preferredHours &&
    constraint.preferredHours.includes(slot.hour)
  ) {
    return 1
  }

  if (!constraint.preferredHours) {
    return 1
  }

  // find the closest hour
  const closest = constraint.preferredHours.reduce((prev, curr) =>
    Math.abs(curr - slot.hour) < Math.abs(prev - slot.hour) ? curr : prev,
  )
  const distance = Math.abs(closest - slot.hour)
  return 1 - distance / 12
}
