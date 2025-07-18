import { DataContext } from '@/types/data'
import { Activity } from '@/types/activities'
import { IntervalActivitySelection, suggestActivity } from '@/utils/activities'
import { formatTime } from '@/utils/dates'
import React, { useEffect } from 'react'

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
}: {
  dataContext: DataContext
  date: Date
  activities: Activity[]
}) {
  const [activitySelections, setActivitySelections] = React.useState<
    IntervalActivitySelection[]
  >([])
  const [selectionIndex, setSelectionIndex] = React.useState(0)

  useEffect(() => {
    setActivitySelections(suggestActivity(date, dataContext, activities))
  }, [date, dataContext, activities])

  const activitySelection =
    activitySelections.length > 0 ? activitySelections[selectionIndex] : null

  if (!activitySelection) {
    return (
      <div className="card card-lg shadow-sm">
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
      className={`join-item min-w-36 btn btn-outline ${disabled ? 'btn-disabled' : ''}`}
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

  const hasCardActions = activitySelections.length > 1

  return (
    <div className="card card-lg shadow-sm">
      <div className="card-body">
        <div className="card-title">Suggested Activity</div>
        <IntervalActivity selection={activitySelection} />
        {hasCardActions || (
          <div className="card-actions">
            <div className="join justify-center w-full">
              <NavSuggestionButton
                direction="prev"
                disabled={selectionIndex === 0}
              />
              <NavSuggestionButton
                direction="next"
                disabled={selectionIndex === activitySelections.length - 1}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
