import { CardinalDirection, DataContext, TideType } from '@/types/data'

type _Constraint<TypeName extends string> = {
  type: TypeName
  description: string
}

export type ComparisonConstraint<
  TypeName extends string,
  Value,
> = _Constraint<TypeName> & {
  comp: 'lt' | 'gt' | 'lte' | 'gte'
  value: Value
}

export type TimeConstraint = ComparisonConstraint<'time', Date>

export type WindSpeedConstraint = ComparisonConstraint<'wind-speed', number>

export type WindDirectionConstraint = _Constraint<'wind-direction'> & {
  direction: CardinalDirection
}

export type HighTideHeightConstraint = ComparisonConstraint<
  'hightide-height',
  number
> & { tideType: TideType }
export type LowTideHeightConstraint = ComparisonConstraint<
  'lowtide-height',
  number
> & { tideType: TideType }
export type TideHeightConstraint =
  | HighTideHeightConstraint
  | LowTideHeightConstraint

export type TideStateConstraint = _Constraint<'tide-state'> & {
  tideType: TideType
  deltaHours?: number
}

export type SunConstraint = _Constraint<'sun'> & {
  isDaylight: boolean
}

export type Constraint =
  | TimeConstraint
  | WindSpeedConstraint
  | WindDirectionConstraint
  | HighTideHeightConstraint
  | LowTideHeightConstraint
  | TideStateConstraint
  | SunConstraint

export type Activity = {
  displayName: string
  label: string
  // imageUrl?: string;
  constraints: Constraint[]
}

export const NullActivity: Activity = {
  displayName: 'Unknown',
  label: 'unknown',
  constraints: [],
}
