'use client'

import { APP_CONFIG } from '@/config'
import { useActivities } from '@/hooks/useApiRequest'
import { Activity, Constraint } from '@/types/activity'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'

export default function ActivitySettings() {
  const initialActivities = useActivities(APP_CONFIG.activityFetcher)
  const [activities, setActivities] = useState<Activity[]>([])
  useEffect(() => {
    setActivities(initialActivities)
  }, [initialActivities])

  const onDeleteActivity = (id: string) => {
    setActivities(activities.filter((item) => item.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Activity Settings</h1>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onDelete={() => {
            onDeleteActivity(activity.id)
          }}
        />
      ))}
    </div>
  )
}

type ActivityCardProps = {
  activity: Activity
  onDelete: () => void
}

function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const onEdit = () => {}

  return (
    <div className="card card-lg my-2 shadow-sm">
      <div className="card-body">
        <div className="card-title flex flex-row justify-between">
          <div className="flex-1">{activity.name}</div>
          <button
            className="btn btn-ghost rounded-field aspect-square p-1"
            onClick={onEdit}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            className="btn btn-ghost rounded-field aspect-square p-1"
            onClick={onDelete}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
        <div>{activity.description}</div>
        <div
          tabIndex={0}
          className="collapse-arrow bg-base-100 border-base-content/20 collapse border"
        >
          <div className="collapse-title font-semibold">
            Show constraints{' '}
            <div className="badge badge-sm badge-secondary">
              {activity.constraints.length}
            </div>
          </div>
          <div className="collapse-content">
            <div className="text-xs">
              Each of these constraints will be scored from 0 to 1 based on the
              available daily data.
            </div>
            <div>
              {activity.constraints.map((constraint, i) => (
                <ActivityConstraint
                  key={`${i}:${constraint.type}`}
                  constraint={constraint}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type ActivityConstraintProps = {
  constraint: Constraint
}

function ActivityConstraint({ constraint }: ActivityConstraintProps) {
  return <div className="text-sm">{JSON.stringify(constraint, null, 2)}</div>
}
