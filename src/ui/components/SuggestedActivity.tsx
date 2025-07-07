import { DataContext } from '@/types/data'
import { Activity } from '@/types/activities'
import { IntervalActivitySelection, suggestActivity } from '@/utils/activities'
import { format } from 'date-fns'
import { formatTime } from '@/utils/dates'

const daylightConstraint = {
  description: "it's daylight hours",
  isDaylight: true,
  type: 'sun',
} as const

const exampleActivities: Activity[] = [
  {
    constraints: [
      {
        comp: 'gt',
        description: 'not too early',
        type: 'time',
        value: '09:00',
      },
      {
        comp: 'lt',
        description: 'not too late',
        type: 'time',
        value: '16:45',
      },
      daylightConstraint,
      {
        comp: 'lt',
        description: 'not much wind',
        type: 'wind-speed',
        value: 15,
      },
      {
        comp: 'gt',
        description: 'tide more than 1.8m',
        tideType: 'high',
        type: 'hightide-height',
        value: 1.8,
      },
    ],
    displayName: 'Paddle boarding',
    label: 'paddle-board',
  },
  {
    constraints: [
      daylightConstraint,
      {
        deltaHours: 1,
        description: 'the tide is low',
        tideType: 'low',
        type: 'tide-state',
      },
    ],
    displayName: 'Swim in Bank Hole',
    label: 'bank-hole',
  },
]

function IntervalActivity({
  selection,
}: {
  selection: IntervalActivitySelection
}) {
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
}: {
  dataContext: DataContext
  date: Date
}) {
  const activitySelection = suggestActivity(
    date,
    dataContext,
    exampleActivities,
  )

  return (
    <div>
      <h4 className="text-xl">Suggested Activity:</h4>
      <IntervalActivity selection={activitySelection} />
    </div>
  )
}
