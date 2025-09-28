import { TideType } from '@/lib/types/context'
import * as z from 'zod'

const optionalNumber = z.preprocess((val) => {
  // @ts-expect-error something wrong with isNaN here
  if (val === null || val === undefined || val === '' || isNaN(val)) {
    return undefined
  }
  return val
}, z.number().optional())

export const WindConstraint = z.object({
  // tolerance in degrees for preferred directions
  directionTolerance: optionalNumber,
  maxGustSpeed: optionalNumber, // m/s
  maxSpeed: optionalNumber, // m/s
  minSpeed: optionalNumber, // m/s
  preferredDirections: z.array(z.coerce.number()).optional(),
  type: z.literal('wind'),
})

export type TWindConstraint = z.output<typeof WindConstraint>

export const WeatherConstraint = z.object({
  maxCloudCover: optionalNumber,
  maxTemperature: optionalNumber,
  minTemperature: optionalNumber,
  maxUvIndex: optionalNumber,
  maxPrecipitationProbability: optionalNumber,
  type: z.literal('weather'),
})

export type TWeatherConstraint = z.output<typeof WeatherConstraint>

export const TideConstraint = z.object({
  eventType: TideType.optional(),
  maxHeight: optionalNumber,
  minHeight: optionalNumber,
  maxHoursAfter: optionalNumber,
  maxHoursBefore: optionalNumber,
  type: z.literal('tide'),
})

export type TTideConstraint = z.output<typeof TideConstraint>

export const SunConstraint = z.object({
  maxHoursBeforeSunset: optionalNumber,
  minHoursAfterSunrise: optionalNumber,
  requiresDarkness: z.boolean().optional(),
  requiresDaylight: z.boolean().optional(),
  type: z.literal('sun'),
})

export type TSunConstraint = z.output<typeof SunConstraint>

export const TimeConstraint = z.object({
  earliestHour: optionalNumber,
  latestHour: optionalNumber,
  preferredHours: z.array(z.coerce.number()).nullish(),
  type: z.literal('time'),
})

export type TTimeConstraint = z.output<typeof TimeConstraint>

export const DayConstraint = z.object({
  isWeekday: z.boolean().nullish(),
  isWeekend: z.boolean().nullish(),
  dateRanges: z
    .array(
      z.object({
        start: z.string(),
        end: z.string(),
      }),
    )
    .nullish(),
  type: z.literal('day'),
})
export type TDayConstraint = z.output<typeof DayConstraint>

export const Activity = z.object({
  constraints: z
    .array(
      z.discriminatedUnion('type', [
        WindConstraint,
        WeatherConstraint,
        TideConstraint,
        SunConstraint,
        TimeConstraint,
        DayConstraint,
      ]),
    )
    .min(1, { message: 'At least one constraint is required' }),
  description: z.string(),
  id: z.string(),
  name: z.string(),
  priority: z.coerce.number().min(1).max(10).default(1),
  scope: z.literal('global').or(z.literal('user')),
  version: z.number(),
  ignoreOoh: z.boolean(),
})

export type TActivity = z.output<typeof Activity>

export type Constraint = TActivity['constraints'][number]
