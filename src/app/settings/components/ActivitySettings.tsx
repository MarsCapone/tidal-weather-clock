'use client'

import { LabelledInput } from '@/components/forms/FormComponents'
import { APP_CONFIG } from '@/config'
import { useActivities } from '@/hooks/useApiRequest'
import {
  Activity,
  Constraint,
  SunConstraint,
  TimeConstraint,
} from '@/types/activity'
import { fractionalTimeToString, withFractionalTime } from '@/utils/dates'
import { capitalize } from '@/utils/string'
import { PencilIcon, PlusIcon, SaveIcon, TrashIcon } from 'lucide-react'
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

  const addActivity = () => {
    setActivities([
      {
        id: `abc-${activities.length + 1}`,
        name: 'random name',
        description: '',
        priority: 5,
        constraints: [],
      },
      ...activities,
    ])
  }

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <h1 className="px-4 text-2xl font-bold">Activity Settings</h1>
        <button className="btn btn-primary rounded-field" onClick={addActivity}>
          Add Activity <PlusIcon className="h-4 w-4" />
        </button>
      </div>
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
              className={`input input-lg ${editable ? '' : 'input-ghost'}`}
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
        <div className="flex flex-col gap-2">
          {activity.constraints.map((constraint, i) => (
            <ActivityConstraint
              key={`${i}:${constraint.type}`}
              constraint={constraint}
              editable={editable}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type ActivityConstraintProps<T> = {
  editable: boolean
  constraint: T
}

function ActivityConstraint({
  constraint,
  editable,
}: ActivityConstraintProps<Constraint>) {
  let controls

  switch (constraint.type) {
    case 'time':
      controls = (
        <TimeConstraintControls constraint={constraint} editable={editable} />
      )
      break
    case 'sun':
      controls = (
        <SunConstraintControls constraint={constraint} editable={editable} />
      )
      break
    default:
      controls = null
  }

  return (
    <div>
      <div className={'text-sm font-bold'}>
        {capitalize(constraint.type)} Constraint
      </div>
      {controls}
    </div>
  )
}

type TimeConstraintControlsProps = ActivityConstraintProps<TimeConstraint>

function TimeConstraintControls({
  constraint,
  editable,
}: TimeConstraintControlsProps) {
  return (
    <div className="flex flex-row gap-2">
      <LabelledInput
        optional={true}
        type="time"
        label="Earliest time"
        defaultValue={fractionalTimeToString(constraint.earliestHour)}
        inputClasses={editable ? '' : 'input-ghost'}
        fieldsetClasses={'w-1/3'}
        readonly={!editable}
      />
      <LabelledInput
        optional={true}
        type="time"
        label="Latest time"
        defaultValue={fractionalTimeToString(constraint.latestHour)}
        fieldsetClasses={'w-1/3'}
        readonly={!editable}
      />
      <LabelledInput
        optional={true}
        type="text"
        label="Preferred hours"
        defaultValue={constraint.preferredHours?.join(', ')}
        fieldsetClasses={'w-1/3'}
        readonly={!editable}
      />
    </div>
  )
}

type SunConstraintControlsProps = ActivityConstraintProps<SunConstraint>

function SunConstraintControls({
  editable,
  constraint,
}: SunConstraintControlsProps) {
  return (
    <div className="flex flex-row justify-between gap-2">
      <LabelledInput
        label={'Maximum hours before sunset'}
        type="number"
        defaultValue={constraint.maxHoursBeforeSunset?.toString() || '0'}
        optional={true}
        readonly={!editable}
        fieldsetClasses={'w-1/4'}
      />
      <LabelledInput
        label={'Minimum hours after sunrise'}
        type="number"
        defaultValue={constraint.minHoursAfterSunrise?.toString() || '0'}
        optional={true}
        readonly={!editable}
        fieldsetClasses={'w-1/4'}
      />
      <label className="label mt-2">
        <input
          type="checkbox"
          defaultChecked={constraint.requiresDaylight || false}
          className="checkbox checkbox-xl rounded-field"
          readOnly={!editable}
          disabled={!editable}
        />
        Requires daylight
      </label>
      <label className="label mt-2">
        <input
          type="checkbox"
          defaultChecked={constraint.requiresDarkness || false}
          className="checkbox checkbox-xl rounded-field"
          readOnly={!editable}
          disabled={!editable}
        />
        Requires darkness
      </label>
    </div>
  )
}
