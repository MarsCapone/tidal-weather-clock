import {
  Constraint,
  HighTideHeightConstraint,
  LowTideHeightConstraint,
  SunConstraint,
  TideStateConstraint,
  TimeConstraint,
  WindDirectionConstraint,
  WindSpeedConstraint,
} from '@/types/legacyActivities'
import CompassIcon from '@/ui/components/icons/CompassIcon'
import { SunnyIcon } from '@/ui/components/icons/WeatherIcon'
import { MoonIcon } from '@heroicons/react/24/outline'
import {
  HighWaterIcon,
  LowWaterIcon,
  TideHeightIcon,
} from '@/ui/components/icons/TideIcon'
import React from 'react'
import ClockIcon from '@/ui/components/icons/ClockIcon'
import { WindIcon } from '@/ui/components/icons/WindIcon'

type ExplanationReasonProps = {
  constraint: Constraint
}

export default function ExplanationReason({
  constraint,
}: ExplanationReasonProps) {
  const reason = explainConstraint(constraint)
  if (reason === null) {
    return null
  }

  const { description, details, Icon, title } = reason

  return (
    <div className="flex flex-row gap-2">
      <div>
        <Icon className={'text-primary'} height={48} width={48} />
      </div>
      <div className="text-start w-dvw">
        <div className="text-xl text-primary">{title}</div>
        <div className="flex flex-col gap-x-2">
          <p className={'list-col-wrap'}>{description}</p>
          <div className={`list-col-wrap text-xs font-mono opacity-60`}>
            {details.map((detail, i) => (
              <Detail {...detail} key={`detail-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={`flex flex-row gap-x-2 justify-between`}>
      <span className="font-bold">{label}</span>
      <span>{value}</span>
    </div>
  )
}

type ConstraintDetail = {
  description: string
  details: { label: string; value: string }[]
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
}

export function explainConstraint(
  constraint: Constraint,
): ConstraintDetail | null {
  switch (constraint.type) {
    case 'time':
      return explainTimeConstraint(constraint as TimeConstraint)
    case 'wind-speed':
      return explainWindSpeedConstraint(constraint as WindSpeedConstraint)
    case 'wind-direction':
      return explainWindDirectionConstraint(
        constraint as WindDirectionConstraint,
      )
    case 'hightide-height':
    case 'lowtide-height':
      return explainTideHeightConstraint(
        constraint as HighTideHeightConstraint | LowTideHeightConstraint,
      )
    case 'tide-state':
      return explainTideStateConstraint(constraint as TideStateConstraint)
    case 'sun':
      return explainSunConstraint(constraint as SunConstraint)
    default:
      return null
  }
}

function constraintToDetails(
  constraint: Constraint,
): { label: string; value: string }[] {
  return Object.entries(constraint).map(([key, value]) => ({
    label: key,
    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
  }))
}

function explainTimeConstraint(constraint: TimeConstraint): ConstraintDetail {
  const timeComparisonMap = {
    gt: 'after',
    gte: 'after or at',
    lt: 'before',
    lte: 'before or at',
  }

  return {
    description: `The time is ${timeComparisonMap[constraint.comp]} ${constraint.value}`,
    details: constraintToDetails(constraint),
    Icon: ClockIcon,
    title: 'Time Constraint',
  }
}

const comparisonDescriptionMap = {
  gt: 'greater than',
  gte: 'greater than or equal to',
  lt: 'less than',
  lte: 'less than or equal to',
}

function explainWindSpeedConstraint(
  constraint: WindSpeedConstraint,
): ConstraintDetail {
  return {
    description: `The wind speed is ${comparisonDescriptionMap[constraint.comp]} ${constraint.value} kts`,
    details: constraintToDetails(constraint),
    Icon: WindIcon,
    title: 'Wind Speed Constraint',
  }
}

function explainWindDirectionConstraint(
  constraint: WindDirectionConstraint,
): ConstraintDetail {
  const directionMap: Record<string, string> = {
    E: 'East',
    N: 'North',
    NE: 'North East',
    NW: 'North West',
    S: 'South',
    SE: 'South East',
    SW: 'South West',
    W: 'West',
  }
  return {
    description: `The wind is coming from the ${directionMap[constraint.direction]}`,
    details: constraintToDetails(constraint),
    Icon: CompassIcon,
    title: 'Wind Direction Constraint',
  }
}

function explainTideHeightConstraint(
  constraint: HighTideHeightConstraint | LowTideHeightConstraint,
): ConstraintDetail {
  return {
    description: `The height of ${constraint.tideType.toUpperCase()} tide is ${comparisonDescriptionMap[constraint.comp]} ${constraint.value.toFixed(1)} meters`,
    details: constraintToDetails(constraint),
    Icon: TideHeightIcon,
    title: 'Tide Height Constraint',
  }
}

function explainTideStateConstraint(
  constraint: TideStateConstraint,
): ConstraintDetail {
  return {
    description: `The time is within ${constraint.deltaHours} hours of ${constraint.tideType.toUpperCase()} tide`,
    details: constraintToDetails(constraint),
    Icon: constraint.tideType === 'high' ? HighWaterIcon : LowWaterIcon,
    title: 'Tide State Constraint',
  }
}

function explainSunConstraint(constraint: SunConstraint): ConstraintDetail {
  return {
    description: `The time is during ${constraint.isDaylight ? 'daylight' : 'nighttime'}`,
    details: constraintToDetails(constraint),
    Icon: constraint.isDaylight ? SunnyIcon : MoonIcon,
    title: 'Sun Constraint',
  }
}
