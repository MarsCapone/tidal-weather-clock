import { CardinalDirection, DataContext, TideType } from '@/types/data'

type _Constraint<TypeName> = {
  type: TypeName
  description: string
}

type _ComparisonConstraint<TypeName> = _Constraint<TypeName> & {
  comp: 'lt' | 'gt' | 'lte' | 'gte'
}

type TimeConstraint = _ComparisonConstraint<'time'> & {
  hour: number
  minute?: number
}

type WindSpeedConstraint = _ComparisonConstraint<'wind-speed'> & {
  knots: number
}

type WindDirectionConstraint = _Constraint<'wind-direction'> & {
  direction: CardinalDirection
}

type TideHeightConstraint = _ComparisonConstraint<'tide-height'> & {
  height: number
}

type TideStateConstraint = _Constraint<'tide-state'> & {
  tideType: TideType
  deltaHours?: number
}

type SunConstraint = _Constraint<'sun'> & {
  isDaylight: boolean
}

type DurationConstraint = _Constraint<'duration'> & {
  minutes: number
}

type Constraint =
  | TimeConstraint
  | WindSpeedConstraint
  | WindDirectionConstraint
  | TideHeightConstraint
  | TideStateConstraint
  | SunConstraint
  | DurationConstraint

export type Activity = {
  displayName: string
  label: string
  // imageUrl?: string;
  constraints: Constraint[]
}

export type ActivitySelection = {
  activity: Activity
  matchingConstraints: Constraint[]
  reasoning?: string[]
}
