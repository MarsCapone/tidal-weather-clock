import { DataContext } from '@/types/data'
import {
  Activity,
  Constraint,
  HighTideHeightConstraint,
  LowTideHeightConstraint,
  SunConstraint,
  TideStateConstraint,
  TimeConstraint,
  WindDirectionConstraint,
  WindSpeedConstraint,
} from '@/types/activities'
import { IntervalActivitySelection, suggestActivity } from '@/utils/activities'
import { formatTime } from '@/utils/dates'
import React, { useEffect } from 'react'
import { useFeatureFlags } from '@/utils/featureFlags'
import { format } from 'date-fns'
import { SunIcon } from '@heroicons/react/24/solid'
import { SunriseIcon } from '@/ui/components/icons/SunStateIcon'

export default function SuggestedActivity({
  dataContext,
  date,
  activities,
  className,
}: {
  dataContext: DataContext
  date: Date
  activities: Activity[]
  className?: string
}) {
  const [activitySelections, setActivitySelections] = React.useState<
    IntervalActivitySelection[]
  >([])
  const [selectionIndex, setSelectionIndex] = React.useState(0)
  const ff = useFeatureFlags()

  useEffect(() => {
    setActivitySelections(suggestActivity(date, dataContext, activities))
  }, [date, dataContext, activities])

  const activitySelection =
    activitySelections.length > 0 ? activitySelections[selectionIndex] : null

  if (!activitySelection) {
    return (
      <div className={`card card-lg shadow-sm ${className || ''}`}>
        <div className="card-body">
          <div className="card-title">Suggested Activity</div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const NavSuggestionButton = ({
    direction,
    disabled,
  }: {
    direction: 'next' | 'prev'
    disabled: boolean
  }) => (
    <button
      className={`w-24 btn btn-outline ${disabled ? 'btn-disabled' : ''}`}
      onClick={() => {
        if (!disabled) {
          setSelectionIndex(
            direction === 'next' ? selectionIndex + 1 : selectionIndex - 1,
          )
        }
      }}
    >
      {direction === 'next' ? 'Next' : 'Previous'}
    </button>
  )

  const hasCardActions =
    ff.alwaysShowActivityNextButton || activitySelections.length > 1

  const dialogId = 'activity-explanation-dialog'
  const openDialog = () => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement
    if (dialog) {
      dialog.showModal()
    }
  }

  return (
    <div className={`card card-lg shadow-sm ${className || ''}`}>
      <div className="card-body">
        <div className="card-title">Suggested Activity</div>

        <p className="text-2xl font-extrabold">
          {activitySelection.activity.displayName}
        </p>
        <div className="flex flex-row text-sm font-mono text-base-content/50">
          <p>
            {format(activitySelection.interval.start, 'HH:mm')} -{' '}
            {format(activitySelection.interval.end, 'HH:mm')}
          </p>
        </div>
        <div className="card-actions">
          <div className="w-full">
            <div className="flex flex-row justify-between gap-x-2">
              {hasCardActions && (
                <NavSuggestionButton
                  direction="prev"
                  disabled={selectionIndex === 0}
                />
              )}
              <div
                className="btn btn-primary flex-grow"
                onClick={() => openDialog()}
              >
                Explain
              </div>
              {hasCardActions && (
                <NavSuggestionButton
                  direction="next"
                  disabled={selectionIndex === activitySelections.length - 1}
                />
              )}
            </div>
          </div>
          <ActivityExplanationDialog
            activitySelection={activitySelection}
            id={dialogId}
          />
        </div>
      </div>
    </div>
  )
}

function ActivityExplanationDialog({
  activitySelection,
  id,
}: {
  activitySelection: IntervalActivitySelection
  id: string
}) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <p className="text-2xl font-extrabold">
          {activitySelection.activity.displayName}
        </p>
        <div className="flex flex-row text-sm font-mono text-base-content/50">
          <p>
            {format(activitySelection.interval.start, 'HH:mm')} -{' '}
            {format(activitySelection.interval.end, 'HH:mm')}
          </p>
        </div>
        <ul className="list">
          {activitySelection.matchingConstraints.map((constraint, i) => {
            const reasonProps = explainConstraint(constraint)
            if (!reasonProps) {
              return null
            }
            return <ExplanationReason key={`reason-${i}`} {...reasonProps} />
          })}
        </ul>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

type ExplanationReasonProps = {
  title: string
  description?: string
  details: { label: string; value: string }[]
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

function ExplanationReason({
  title,
  description,
  details,
  Icon,
}: ExplanationReasonProps) {
  return (
    <li className="list-row text-start">
      <div>{Icon && <Icon width={48} height={48} />}</div>
      <div>
        <div className="text-xl text-primary">{title}</div>
        <div className="flex flex-row gap-x-2">
          {description && (
            <p className={'list-col-wrap flex-1 w-1/2'}>{description}</p>
          )}
          <div
            className={`list-col-wrap text-xs font-mono opacity-60 ${description ? '' : 'w-full'}`}
          >
            {details.map((detail, i) => (
              <Detail {...detail} key={`detail-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </li>
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

function explainConstraint(
  constraint: Constraint,
): ExplanationReasonProps | null {
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

function demoExplainConstraint(constraint: Constraint): ExplanationReasonProps {
  return {
    title: 'something about ' + constraint.type,
    description:
      'perhaps a much longer description of the constraint goes here',
    details: Object.entries(constraint).map(([key, value]) => ({
      label: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    })),
    Icon: SunriseIcon,
  }
}

function explainTimeConstraint(
  constraint: TimeConstraint,
): ExplanationReasonProps {
  return demoExplainConstraint(constraint)
}

function explainWindSpeedConstraint(
  constraint: WindSpeedConstraint,
): ExplanationReasonProps {
  return demoExplainConstraint(constraint)
}

function explainWindDirectionConstraint(
  constraint: WindDirectionConstraint,
): ExplanationReasonProps {
  return demoExplainConstraint(constraint)
}

function explainTideHeightConstraint(
  constraint: HighTideHeightConstraint | LowTideHeightConstraint,
): ExplanationReasonProps {
  return demoExplainConstraint(constraint)
}

function explainTideStateConstraint(
  constraint: TideStateConstraint,
): ExplanationReasonProps {
  return demoExplainConstraint(constraint)
}

function explainSunConstraint(
  constraint: SunConstraint,
): ExplanationReasonProps {
  return demoExplainConstraint(constraint)
}
