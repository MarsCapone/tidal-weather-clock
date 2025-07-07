import { DataContext } from '@/types/data'
import { Activity } from '@/types/activities'
import { suggestActivity } from '@/utils/activities'

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
        value: new Date(0, 0, 0, 9),
      },
      {
        comp: 'lt',
        description: 'not too late',
        type: 'time',
        value: new Date(0, 0, 0, 16),
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
      <h2 className="text-3xl">{activitySelection.activity.displayName}</h2>
      {activitySelection.matchingConstraints.map((c, i) => (
        <p key={`${c.type}-reason-${i}`}>{c.description}</p>
      ))}
    </div>
  )
}
