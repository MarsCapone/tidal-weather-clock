import { DataContext } from '@/types/data'
import {
  Activity,
  ComparisonConstraint,
  Constraint,
  NullActivity,
  SunConstraint,
  TideHeightConstraint,
  TideStateConstraint,
  TimeConstraint,
  WindDirectionConstraint,
  WindSpeedConstraint,
} from '@/types/activities'
import {
  addDays,
  eachMinuteOfInterval,
  Interval,
  compareAsc,
  addHours,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns'

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
  constraint: ComparisonConstraint<any, T>,
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

const truthy = (v: any): boolean => !!v

function evaluateTimeConstraint(
  constraint: TimeConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  return evaluateComparisonConstraint<Date>(
    constraint,
    compareAsc as (a: Date, b: Date) => 0 | 1 | -1,
    timestamp,
  )
}

function evaluateWindSpeedConstraint(
  constraint: WindSpeedConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.windData) return false
  return false
}

function evaluateWindDirectionConstraint(
  constraint: WindDirectionConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.windData) return false
  return false
}

function evaluateTideHeightConstraint(
  constraint: TideHeightConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.tideData) return false
  // find tides of the correct type
  // apply the comparison on them
  // return if any of the comparisons succeeded
  return context.tideData.points
    .filter((p) => p.type === constraint.tideType)
    .map((point) =>
      evaluateComparisonConstraint(constraint, numberComparison, point.height),
    )
    .some(truthy)
}

function evaluateTideStateConstraint(
  constraint: TideStateConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  // find the timestamps of the constraint tideType
  // is the timestamp within the discovered time +/- the delta?
  if (!context.tideData) return false

  const timestamps = context.tideData.points
    .filter((p) => p.type === constraint.tideType)
    .map((p) => p.timestamp)
  const deltaHours = constraint.deltaHours || 0
  const intervals = timestamps.map((timestamp) => ({
    start: addHours(timestamp, -deltaHours),
    end: addHours(timestamp, deltaHours),
  }))

  return intervals.some((interval) => isWithinInterval(timestamp, interval))
}

function evaluateSunConstraint(
  constraint: SunConstraint,
  timestamp: Date,
  context: DataContext,
): boolean {
  if (!context.sunData) return false

  // true if the timestamp is between sunrise and sunset
  return isWithinInterval(timestamp, {
    start: context.sunData.sunRise,
    end: context.sunData.sunSet,
  })
}

const evaluationFunctions: Record<Constraint['type'], Function> = {
  time: evaluateTimeConstraint,
  'wind-speed': evaluateWindSpeedConstraint,
  'wind-direction': evaluateWindDirectionConstraint,
  'hightide-height': evaluateTideHeightConstraint,
  'lowtide-height': evaluateTideHeightConstraint,
  'tide-state': evaluateTideStateConstraint,
  sun: evaluateSunConstraint,
}

type ConstraintResults = {
  constraint: Constraint
  timestamp: Date
}[]

function evaluateAllConstraints(
  constraints: Constraint[],
  interval: Interval,
  context: DataContext,
): ConstraintResults {
  const timestamps = eachMinuteOfInterval(interval, {
    step: _PERIOD_GRANULARITY_MINUTES,
  })

  const results: ConstraintResults = []

  timestamps.forEach((timestamp) => {
    constraints.forEach((constraint) => {
      const result = evaluationFunctions[constraint.type](
        constraint,
        timestamp,
        context,
      )
      if (result) {
        results.push({
          constraint: constraint,
          timestamp: timestamp,
        })
      }
    })
  })

  return results
}

type ActivitySelection = {
  activity: Activity
  matchingConstraints: ConstraintResults
  reasoning?: string[]
}

export function suggestActivity(
  date: Date,
  context: DataContext,
  activities: Activity[],
): ActivitySelection {
  const interval = {
    start: startOfDay(date),
    end: endOfDay(date),
  }

  const best: {
    activity: Activity
    matchingConstraints: ConstraintResults
  } = {
    activity: NullActivity,
    matchingConstraints: [],
  }

  activities.forEach((activity) => {
    const matchingConstraints = evaluateAllConstraints(
      activity.constraints,
      interval,
      context,
    )
    if (matchingConstraints.length > best.matchingConstraints.length) {
      best.activity = activity
      best.matchingConstraints = matchingConstraints
    }
  })

  return {
    activity: best.activity,
    matchingConstraints: best.matchingConstraints,
    reasoning: best.matchingConstraints.map((c) => c.constraint.description),
  }
}
