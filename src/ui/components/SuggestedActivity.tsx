import { DataContext } from '@/types/data'
import { Activity } from '@/types/activities'
import { IntervalActivitySelection, suggestActivity } from '@/utils/activities'
import React, { useEffect } from 'react'
import { useFeatureFlags } from '@/utils/featureFlags'
import { format } from 'date-fns'
import { Activities } from '@/ui/constants'
import ExplanationReason from '@/ui/components/ExplanationReason'

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
    className,
  }: {
    direction: 'next' | 'prev'
    disabled: boolean
    className?: string
  }) => (
    <button
      className={`w-24 btn btn-outline ${disabled ? 'btn-disabled' : ''} ${className || ''}`}
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

  const dialogId = `activity-explanation-dialog`
  const openDialog = () => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement
    if (dialog) {
      dialog.showModal()
    }
  }

  return (
    <>
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
              <div className="md:flex flex-col hidden lg:hidden gap-y-2 items-center">
                <div
                  className="btn btn-primary flex-grow"
                  onClick={() => openDialog()}
                >
                  Explain
                </div>
                {hasCardActions && (
                  <div className="join">
                    <NavSuggestionButton
                      direction="prev"
                      disabled={selectionIndex === 0}
                      className="join-item"
                    />
                    <NavSuggestionButton
                      direction="next"
                      disabled={
                        selectionIndex === activitySelections.length - 1
                      }
                      className="join-item"
                    />
                  </div>
                )}
              </div>
              <div className="md:hidden flex lg:flex flex-row justify-between gap-x-2">
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
          </div>
        </div>
      </div>
      <ActivityExplanationDialog
        activitySelection={activitySelection}
        id={dialogId}
      />
    </>
  )
}

export function ActivityExplanationDialog({
  activitySelection,
  id,
}: {
  activitySelection: IntervalActivitySelection
  id: string
}) {
  const ff = useFeatureFlags()

  const constraints = ff.useDemoActivities
    ? Activities[0].constraints
    : activitySelection.matchingConstraints

  return (
    <dialog id={id} className="modal">
      <div className="modal-box flex flex-col justify-center items-center">
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
          {constraints.map((constraint, i) => (
            <ExplanationReason
              key={`constraint-${i}`}
              constraint={constraint}
            />
          ))}
        </ul>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
