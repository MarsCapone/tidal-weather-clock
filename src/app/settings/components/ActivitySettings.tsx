'use client'

import { APP_CONFIG } from '@/config'
import { useActivities } from '@/hooks/useApiRequest'
import { Activity, Constraint } from '@/types/activity'

export default function ActivitySettings() {
  const activities = useActivities(APP_CONFIG.activityFetcher)

  return (
    <div>
      <h1 className="text-2xl font-bold">Activity Settings</h1>
      {activities.map((activity) => (
        <ActivityCard activity={activity} />
      ))}
    </div>
  )
}

type ActivityCardProps = {
  activity: Activity
}

function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="card card-lg my-2 shadow-sm">
      <div className="card-body">
        <div className="card-title">{activity.name}</div>
        <div>{activity.description}</div>
        <div>
          {activity.constraints.map((constraint) => (
            <ActivityConstraint constraint={constraint} />
          ))}
        </div>
      </div>
    </div>
  )
}

type ActivityConstraintProps = {
  constraint: Constraint
}

function ActivityConstraint({ constraint }: ActivityConstraintProps) {
  return <div>{JSON.stringify(constraint, null, 2)}</div>
}
