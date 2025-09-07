import { TideType } from '@/lib/types/context'
// eslint-disable-next-line import-x/no-namespace
import * as z from 'zod'

export const WindConstraint = z.object({
  // tolerance in degrees for preferred directions
  directionTolerance: z.number().optional(),
  maxGustSpeed: z.number().optional(), // m/s
  maxSpeed: z.number().optional(), // m/s
  minSpeed: z.number().optional(), // m/s
  preferredDirections: z.array(z.number()).optional(),
  type: z.literal('wind'),
})

export type TWindConstraint = z.infer<typeof WindConstraint>

export const WeatherConstraint = z.object({
  maxCloudCover: z.number().optional(),
  maxTemperature: z.number().optional(),
  minTemperature: z.number().optional(),
  maxUvIndex: z.number().optional(),
  maxPrecipitationProbability: z.number().optional(),
  type: z.literal('weather'),
})

export type TWeatherConstraint = z.infer<typeof WeatherConstraint>

export const TideConstraint = z.object({
  eventType: TideType.optional(),
  maxHeight: z.number().optional(),
  minHeight: z.number().optional(),
  maxHoursAfter: z.number().optional(),
  maxHoursBefore: z.number().optional(),
  type: z.literal('tide'),
})

export type TTideConstraint = z.infer<typeof TideConstraint>

export const SunConstraint = z.object({
  maxHoursBeforeSunset: z.number().optional(),
  minHoursAfterSunrise: z.number().optional(),
  requiresDarkness: z.boolean().optional(),
  requiresDaylight: z.boolean().optional(),
  type: z.literal('sun'),
})

export type TSunConstraint = z.infer<typeof SunConstraint>

export const TimeConstraint = z.object({
  earliestHour: z.number().optional(),
  latestHour: z.number().optional(),
  preferredHours: z.array(z.number()).optional(),
  type: z.literal('time'),
})

export type TTimeConstraint = z.infer<typeof TimeConstraint>

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
export type TDayConstraint = z.infer<typeof DayConstraint>

export type Constraint =
  | TWindConstraint
  | TWeatherConstraint
  | TTideConstraint
  | TSunConstraint
  | TTimeConstraint
  | TDayConstraint

export const Activity = z.object({
  constraints: z.array(
    z.discriminatedUnion('type', [
      WindConstraint,
      WeatherConstraint,
      TideConstraint,
      SunConstraint,
      TimeConstraint,
      DayConstraint,
    ]),
  ),
  description: z.string(),
  id: z.string(),
  name: z.string(),
  priority: z.number(),
  scope: z.literal('global').or(z.literal('user')),
  version: z.number().optional(),
})

export type TActivity = z.infer<typeof Activity>
