import { DataContext } from '@/types/data'
import { Activity } from '@/types/activities'
import { suggestActivity } from '@/utils/activities'

const daylightConstraint = {
  type: 'sun',
  isDaylight: true,
  description: "it's daylight hours",
} as const

const exampleActivities: Activity[] = [
  {
    displayName: 'Paddle boarding',
    label: 'paddle-board',
    constraints: [
      {
        type: 'time',
        comp: 'gt',
        hour: 8,
        minute: 0,
        description: 'not too early',
      },
      {
        type: 'time',
        comp: 'lt',
        hour: 19,
        minute: 0,
        description: 'not too late',
      },
      daylightConstraint,
      {
        type: 'wind-speed',
        comp: 'lt',
        knots: 15,
        description: 'not much wind',
      },
      {
        type: 'tide-height',
        comp: 'gt',
        height: 1.8,
        description: 'tide more than 1.8m',
      },
      { type: 'duration', minutes: 90, description: "there's enough time" },
    ],
  },
  {
    displayName: 'Swim in Bank Hole',
    label: 'bank-hole',
    constraints: [
      daylightConstraint,
      {
        type: 'duration',
        minutes: 20,
        description: "there's enough time for something quick",
      },
      {
        type: 'tide-state',
        tideType: 'low',
        deltaHours: 1,
        description: 'the tide is low',
      },
    ],
  },
]

export default function SuggestedActivity({
  dataContext,
}: {
  dataContext: DataContext
}) {
  const activitySelection = suggestActivity(dataContext, exampleActivities)

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
