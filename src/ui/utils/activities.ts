import { DataContext } from '@/types/data'
import {
  Activity,
  ComparisonConstraint,
  Constraint,
  SunConstraint,
  TideHeightConstraint,
  TideStateConstraint,
  TimeConstraint,
  WindDirectionConstraint,
  WindSpeedConstraint,
} from '@/types/activities'
import {
  addHours,
  eachMinuteOfInterval,
  endOfDay,
  format,
  Interval,
  isWithinInterval,
  startOfDay,
} from 'date-fns'
import arrayEqual from 'array-equal'
import logger from '@/ui/utils/logger'

const _PERIOD_GRANULARITY_MINUTES = 10

type ComparisonFn<T> = (a: T, b: T) => -1 | 0 | 1

/**
 * Evaluate a comparison comparing `value` against the constraint. i.e. if the constraint is <=3,
 * value of 2 should pass and value of 4 should fail.
 * @param constraint The constraint we're checking against
 * @param comparisonFn A comparison function for the value of the constraint. Should return 1 if the first value is
 *  greater than the second.
 * @param value The value to compare against.
 */
function evaluateComparisonConstraint<T>(
  constraint: ComparisonConstraint<string, T>,
  comparisonFn: ComparisonFn<T>,
  value: T,
): boolean {
  const c = comparisonFn(value, constraint.value)

  if (['lte', 'gte'].includes(constraint.comp) && c === 0) {
    // the values are equal
    return true
  }

  if (['gte', 'gt'].includes(constraint.comp)) {
    // is the value greater than comp value?
    return c === 1
  }

  if (['lte', 'lt'].includes(constraint.comp)) {
    // is the value less than comp value?
    return c === -1
  }

  // anything else?
  return false
}

const numberComparison = (a: number, b: number): 0 | 1 | -1 => {
  const v = a - b
  if (v < 0) return -1
  if (v > 0) return 1
  return 0
}

const timeStringComparison = (a: string, b: string) => {
  const [aHour, aMinute] = a.split(':').map((value) => parseInt(value))
  const [bHour, bMinute] = b.split(':').map((value) => parseInt(value))
  return numberComparison(aHour + aMinute / 60, bHour + bMinute / 60)
}

function evaluateTimeConstraint(
  constraint: TimeConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  return evaluateComparisonConstraint<string>(
    constraint,
    timeStringComparison,
    format(timestamp, 'HH:mm'),
  )
}

function evaluateWindSpeedConstraint(
  constraint: WindSpeedConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.windData) {
    return false
  }
  return false
}

function evaluateWindDirectionConstraint(
  constraint: WindDirectionConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.windData) {
    return false
  }
  return false
}

function evaluateTideHeightConstraint(
  constraint: TideHeightConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.tideData) {
    return false
  }
  // find tides of the correct type
  // apply the comparison on them
  // return if any of the comparisons succeeded
  return context.tideData
    .filter((t) => t.type === constraint.tideType)
    .some((point) =>
      evaluateComparisonConstraint(constraint, numberComparison, point.height),
    )
}

function evaluateTideStateConstraint(
  constraint: TideStateConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  // find the timestamps of the constraint tideType
  // is the timestamp within the discovered time +/- the delta?
  if (!context.tideData) {
    return false
  }

  const tides = context.tideData.filter((t) => t.type === constraint.tideType)

  const deltaHours = constraint.deltaHours || 0

  const intervals = tides.map((tide) => ({
    end: addHours(context.referenceDate, deltaHours + tide.time),
    start: addHours(timestamp, -deltaHours + tide.time),
  }))

  return intervals.some((interval) => isWithinInterval(timestamp, interval))
}

function evaluateSunConstraint(
  constraint: SunConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.sunData || !context.sunData.sunRise || !context.sunData.sunSet) {
    return false
  }

  // true if the timestamp is between sunrise and sunset
  return isWithinInterval(timestamp, {
    end: context.sunData.sunSet,
    start: context.sunData.sunRise,
  })
}

type FunctionMap = {
  [K in Constraint['type']]: (
    constraint: Extract<Constraint, { type: K }>,
    date: Date,
    context: DataContext,
  ) => boolean
}

const functionMap: FunctionMap = {
  'hightide-height': evaluateTideHeightConstraint,
  'lowtide-height': evaluateTideHeightConstraint,
  sun: evaluateSunConstraint,
  'tide-state': evaluateTideStateConstraint,
  time: evaluateTimeConstraint,
  'wind-direction': evaluateWindDirectionConstraint,
  'wind-speed': evaluateWindSpeedConstraint,
}

type ConstraintResult = {
  constraint: Constraint
  timestamp: Date
}

function evaluateAllConstraints(
  constraints: Constraint[],
  interval: Interval,
  context: DataContext,
): ConstraintResult[] {
  const timestamps = eachMinuteOfInterval(interval, {
    step: _PERIOD_GRANULARITY_MINUTES,
  })

  const results: ConstraintResult[] = []

  timestamps.forEach((timestamp) => {
    const allConstraintsMatch = constraints.every((constraint) => {
      switch (constraint.type) {
        case 'hightide-height':
          return functionMap['hightide-height'](constraint, timestamp, context)
        case 'lowtide-height':
          return functionMap['lowtide-height'](constraint, timestamp, context)
        case 'tide-state':
          return functionMap['tide-state'](constraint, timestamp, context)
        case 'wind-direction':
          return functionMap['wind-direction'](constraint, timestamp, context)
        case 'wind-speed':
          return functionMap['wind-speed'](constraint, timestamp, context)
        case 'sun':
          return functionMap['sun'](constraint, timestamp, context)
        case 'time':
          return functionMap['time'](constraint, timestamp, context)
      }
    })

    if (allConstraintsMatch) {
      results.push(
        ...constraints.map((constraint) => ({
          constraint: constraint,
          timestamp: timestamp,
        })),
      )
    }
  })

  return results
}

type ActivitySelection = {
  activity: Activity
  timestamp: Date
  matchingConstraints: Constraint[]
}

export function suggestActivities(
  date: Date,
  context: DataContext,
  activities: Activity[],
): ActivitySelection[] {
  const interval = {
    end: endOfDay(date),
    start: startOfDay(date),
  }

  return (
    activities
      .map((activity) => {
        // for each activity, evaluate all the constraints against the input context, for every N minute period
        // group by the time period, so at each time period there is an array of matching constraints
        // filter out the ones that don't have any matches against constraints
        const constraintsByTime = Map.groupBy(
          evaluateAllConstraints(activity.constraints, interval, context),
          (result) => format(result.timestamp, 'HH:mm'),
        )
          .entries()
          .filter(([_, crs]) => crs.length > 0)

        // convert each entry to an object with the activity, the timestamp, and an array of reasons extracted from the
        // constraint descriptions
        return constraintsByTime
          .map(([timeString, crs]) => ({
            activity,
            timestamp: crs[0].timestamp,
            matchingConstraints: crs.map(({ constraint }) => constraint),
          }))
          .toArray()
      })
      .flat() // flatten everything so all objects are at the same level
      // then sort by which activity and timestamp has the most reasons
      .toSorted(
        (a, b) => b.matchingConstraints.length - a.matchingConstraints.length,
      )
  )
}

export type IntervalActivitySelection = ActivitySelection & {
  interval: {
    start: Date
    end: Date
  }
}

export function suggestActivity(
  date: Date,
  context: DataContext,
  activities: Activity[],
): IntervalActivitySelection[] {
  const suggestions = suggestActivities(date, context, activities)

  const goodSuggestions = suggestions.filter(
    (s) =>
      s.matchingConstraints.length ===
      suggestions[0].matchingConstraints.length,
  )

  if (!goodSuggestions.length) {
    return []
  }

  // loop through all the suggestions to create a list of {interval, activity, reasons}
  const activityIntervals: IntervalActivitySelection[] = []
  let current = goodSuggestions[0]
  let interval = { start: current.timestamp, end: current.timestamp }
  for (const suggestion of goodSuggestions) {
    if (
      suggestion.activity.label === current.activity.label &&
      arrayEqual(suggestion.matchingConstraints, current.matchingConstraints)
    ) {
      interval.end = suggestion.timestamp
    } else {
      // we're at the end of the interval, so we need to push that and reset
      activityIntervals.push({
        interval,
        activity: current.activity,
        matchingConstraints: current.matchingConstraints,
        timestamp: interval.start,
      })
      current = suggestion
      interval = { start: suggestion.timestamp, end: suggestion.timestamp }
    }
  }
  // finally push the last interval
  activityIntervals.push({
    interval,
    activity: current.activity,
    matchingConstraints: current.matchingConstraints,
    timestamp: interval.start,
  })

  return activityIntervals
}
