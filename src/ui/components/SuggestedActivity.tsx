import { DataContext } from '@/types/data'
import { Activity } from '@/types/activities'
import { IntervalActivitySelection, suggestActivity } from '@/utils/activities'
import { formatTime } from '@/utils/dates'
import React, { useEffect } from 'react'
import { useFeatureFlags } from '@/utils/featureFlags'
import { format } from 'date-fns'

function IntervalActivity({
  selection,
}: {
  selection: IntervalActivitySelection | null
}) {
  if (!selection) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-error">No activity found</h2>
      </div>
    )
  }
  return (
    <div>
      <h2 className="text-3xl font-bold">{selection.activity.displayName}</h2>
      <h3 className="text-xl">
        {formatTime(selection.interval.start)} -{' '}
        {formatTime(selection.interval.end)}
      </h3>
      <ul>
        {selection.reasons.map((reason, i) => (
          <li key={`reason-${i}`}>{reason}</li>
        ))}
      </ul>
    </div>
  )
}

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
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
