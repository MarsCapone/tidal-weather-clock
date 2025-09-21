import { TideType } from '@/lib/types/context'
import * as z from 'zod'

export const WindConstraint = z.object({
  // tolerance in degrees for preferred directions
  directionTolerance: z.coerce.number().optional(),
  maxGustSpeed: z.coerce.number().optional(), // m/s
  maxSpeed: z.coerce.number().optional(), // m/s
  minSpeed: z.coerce.number().optional(), // m/s
  preferredDirections: z.array(z.coerce.number()).optional(),
  type: z.literal('wind'),
})

export type TWindConstraint = z.output<typeof WindConstraint>

export const WeatherConstraint = z.object({
  maxCloudCover: z.coerce.number().optional(),
  maxTemperature: z.coerce.number().optional(),
  minTemperature: z.coerce.number().optional(),
  maxUvIndex: z.coerce.number().optional(),
  maxPrecipitationProbability: z.coerce.number().optional(),
  type: z.literal('weather'),
})

export type TWeatherConstraint = z.output<typeof WeatherConstraint>

export const TideConstraint = z.object({
  eventType: TideType.optional(),
  maxHeight: z.coerce.number().optional(),
  minHeight: z.coerce.number().optional(),
  maxHoursAfter: z.coerce.number().optional(),
  maxHoursBefore: z.coerce.number().optional(),
  type: z.literal('tide'),
})

export type TTideConstraint = z.output<typeof TideConstraint>

export const SunConstraint = z.object({
  maxHoursBeforeSunset: z.coerce.number().optional(),
  minHoursAfterSunrise: z.coerce.number().optional(),
  requiresDarkness: z.boolean().optional(),
  requiresDaylight: z.boolean().optional(),
  type: z.literal('sun'),
})

export type TSunConstraint = z.output<typeof SunConstraint>

export const TimeConstraint = z.object({
  earliestHour: z.coerce.number().optional(),
  latestHour: z.coerce.number().optional(),
  preferredHours: z.array(z.coerce.number()).optional(),
  type: z.literal('time'),
})

export type TTimeConstraint = z.output<typeof TimeConstraint>

export const DayConstraint = z.object({
  isWeekday: z.boolean().optional(),
  isWeekend: z.boolean().optional(),
  dateRanges: z
    .array(
      z.object({
        start: z.string(),
        end: z.string(),
      }),
    )
    .optional(),
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
  version: z.coerce.number().optional(),
  ignoreOoh: z.boolean(),
})

export type TActivity = z.output<typeof Activity>

export type Constraint = TActivity['constraints'][number]
