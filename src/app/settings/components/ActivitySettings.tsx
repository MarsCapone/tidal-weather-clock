'use client'

import { APP_CONFIG } from '@/config'
import { useActivities } from '@/hooks/useApiRequest'
import { Activity, Constraint } from '@/types/activity'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { PlusIcon, SaveIcon } from 'lucide-react'
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
  const [editable, setEditable] = useState(false)
  const onEdit = () => {
    setEditable(!editable)
  }

  return (
    <div className="card card-lg my-2 shadow-sm">
      <div className="card-body">
        <div className="card-title flex flex-row justify-between">
          <div className="flex-1">
            <input
              type="text"
              className={`input input-lg ${editable ? '' : 'input-ghost'} focus:border-none`}
              defaultValue={activity.name}
              readOnly={!editable}
            />
          </div>
          <div className="tooltip tooltip-bottom" data-tip="Add constraint">
            <button className="btn btn-ghost rounded-field aspect-square p-1">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div
            className="tooltip tooltip-bottom"
            data-tip={editable ? 'Save' : 'Edit'}
          >
            <button
              className={`btn ${editable ? 'btn-accent' : 'btn-ghost'} rounded-field aspect-square p-1`}
              onClick={onEdit}
            >
              {editable ? (
                <SaveIcon className="h-4 w-4" />
              ) : (
                <PencilIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="tooltip tooltip-bottom" data-tip="Delete activity">
            <button
              className="btn btn-ghost rounded-field aspect-square p-1"
              onClick={onDelete}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <input
            type="text"
            className={`input input-md w-full ${editable ? '' : 'input-ghost'}`}
            defaultValue={activity.description}
            readOnly={!editable}
          />
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
  )
}

type ActivityConstraintProps = {
  constraint: Constraint
}

function ActivityConstraint({ constraint }: ActivityConstraintProps) {
  return <div className="text-sm">{JSON.stringify(constraint, null, 2)}</div>
}
