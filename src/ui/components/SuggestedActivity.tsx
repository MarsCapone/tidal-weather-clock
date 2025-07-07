import { DataContext } from '@/types/data'
import { Activity } from '@/types/activities'
import { IntervalActivitySelection, suggestActivity } from '@/utils/activities'
import { formatTime } from '@/utils/dates'

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
  const activitySelection = suggestActivity(date, dataContext, activities)

  return (
    <div>
      <h4 className="text-xl">Suggested Activity:</h4>
      <IntervalActivity selection={activitySelection} />
    </div>
  )
}
