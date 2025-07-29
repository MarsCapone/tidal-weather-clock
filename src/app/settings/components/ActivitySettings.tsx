'use client'

import {
  Fieldset,
  Input,
  PrefixSuffixInput,
} from '@/components/forms/FormComponents'
import { APP_CONFIG } from '@/config'
import { useActivities } from '@/hooks/useApiRequest'
import {
  Activity,
  Constraint,
  SunConstraint,
  TideConstraint,
  TimeConstraint,
  WeatherConstraint,
  WindConstraint,
} from '@/types/activity'
import { fractionalTimeToString } from '@/utils/dates'
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
        constraints: [],
        description: '',
        id: `abc-${activities.length + 1}`,
        name: 'random name',
        priority: 5,
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
          activity={activity}
          key={activity.id}
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
              className={`input input-lg ${editable ? '' : 'input-ghost'}`}
              defaultValue={activity.name}
              readOnly={!editable}
              type="text"
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
            className={`input input-md w-full ${editable ? '' : 'input-ghost'}`}
            defaultValue={activity.description}
            readOnly={!editable}
            type="text"
          />
        </div>
        <div className="flex flex-col gap-2">
          {activity.constraints.map((constraint, i) => (
            <ActivityConstraint
              constraint={constraint}
              constraintId={`${i}:${constraint.type}`}
              editable={editable}
              key={`${i}:${constraint.type}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type ConstraintControlsProps<T> = {
  constraint: T
  editable: boolean
}

type ActivityConstraintProps = ConstraintControlsProps<Constraint> & {
  constraintId: string
}

function ActivityConstraint({
  constraint,
  constraintId,
  editable,
}: ActivityConstraintProps) {
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
    case 'tide':
      controls = (
        <TideConstraintControls constraint={constraint} editable={editable} />
      )
      break
    case 'wind':
      controls = (
        <WindConstraintControls constraint={constraint} editable={editable} />
      )
      break
    case 'weather':
      controls = (
        <WeatherConstraintControls
          constraint={constraint}
          editable={editable}
        />
      )
      break
    default:
      controls = null
  }

  return (
    <div>
      <div className="flex flex-row justify-between">
        <div className={'text-sm font-bold'}>
          {capitalize(constraint.type)} Constraint
        </div>
        <div className="badge badge-info ml-4 font-mono text-xs font-thin">
          {constraintId}
        </div>
      </div>
      {controls}
    </div>
  )
}

type TimeConstraintControlsProps = ConstraintControlsProps<TimeConstraint>

function TimeConstraintControls({
  constraint,
  editable,
}: TimeConstraintControlsProps) {
  return (
    <div className="flex flex-row gap-2">
      <PrefixSuffixInput
        defaultValue={fractionalTimeToString(constraint.earliestHour)}
        label="Earliest time"
        optional={true}
        readonly={!editable}
        type="time"
      />
      <PrefixSuffixInput
        defaultValue={fractionalTimeToString(constraint.latestHour)}
        label="Latest time"
        optional={true}
        readonly={!editable}
        type="time"
      />
      <Input
        defaultValue={constraint.preferredHours?.join(', ')}
        fieldsetClasses={'w-1/3'}
        label="Preferred hours"
        optional={true}
        readonly={!editable}
        type="text"
      />
    </div>
  )
}

type SunConstraintControlsProps = ConstraintControlsProps<SunConstraint>

function SunConstraintControls({
  constraint,
  editable,
}: SunConstraintControlsProps) {
  return (
    <div className="flex flex-row justify-start gap-2">
      <Input
        defaultValue={constraint.maxHoursBeforeSunset?.toString() || '0'}
        fieldsetClasses={'w-1/4'}
        label={'Maximum hours before sunset'}
        optional={true}
        readonly={!editable}
        type="number"
      />
      <Input
        defaultValue={constraint.minHoursAfterSunrise?.toString() || '0'}
        fieldsetClasses={'w-1/4'}
        label={'Minimum hours after sunrise'}
        optional={true}
        readonly={!editable}
        type="number"
      />
      <label className="label mt-2">
        <input
          className="checkbox checkbox-xl rounded-field"
          defaultChecked={constraint.requiresDaylight || false}
          disabled={!editable}
          readOnly={!editable}
          type="checkbox"
        />
        Requires daylight
      </label>
      <label className="label mt-2">
        <input
          className="checkbox checkbox-xl rounded-field"
          defaultChecked={constraint.requiresDarkness || false}
          disabled={!editable}
          readOnly={!editable}
          type="checkbox"
        />
        Requires darkness
      </label>
    </div>
  )
}

type TideConstraintControlsProps = ConstraintControlsProps<TideConstraint>

function TideConstraintControls({
  constraint,
  editable,
}: TideConstraintControlsProps) {
  return (
    <div>
      <div className="flex flex-row justify-start gap-2">
        <PrefixSuffixInput
          defaultValue={constraint.minHeight?.toString()}
          label="Min height"
          optional={true}
          readonly={!editable}
          suffix={'m'}
          type="number"
        />
        <PrefixSuffixInput
          defaultValue={constraint.maxHeight?.toString()}
          label="Max height"
          optional={true}
          readonly={!editable}
          suffix={'m'}
          type="number"
        />
        <Input
          defaultValue={constraint.preferredStates?.join(', ')}
          label="Preferred States"
          optional={true}
          readonly={!editable}
          type="text"
        />
      </div>
      <div className="text-xs font-bold">Time from tide event</div>
      <div className="flex flex-row justify-start gap-2">
        <Fieldset fieldsetClasses="min-w-20" label={'Event type'}>
          <select
            className="select"
            defaultValue={constraint.timeFromTideEvent?.event}
            disabled={!editable}
          >
            <option>High</option>
            <option>Low</option>
          </select>
        </Fieldset>
        <Input
          defaultValue={constraint.timeFromTideEvent?.event}
          label="Event"
          optional={true}
          readonly={!editable}
          type="text"
        />
        <PrefixSuffixInput
          defaultValue={constraint.timeFromTideEvent?.maxHoursAfter?.toString()}
          label="Maximum hours after"
          optional={true}
          readonly={!editable}
          suffix={'hours'}
          type="number"
        />
        <PrefixSuffixInput
          defaultValue={constraint.timeFromTideEvent?.maxHoursBefore?.toString()}
          label="Maximum hours before"
          optional={true}
          readonly={!editable}
          suffix={'hours'}
          type="number"
        />
      </div>
    </div>
  )
}

type WeatherConstraintControlsProps = ConstraintControlsProps<WeatherConstraint>

function WeatherConstraintControls({
  constraint,
  editable,
}: WeatherConstraintControlsProps) {
  const fields = [
    { field: constraint.maxCloudCover, label: 'Max cloud cover', suffix: '%' },
    { field: constraint.maxTemperature, label: 'Maximum temperature' },
    { field: constraint.minTemperature, label: 'Minimum temperature' },
  ]
  return (
    <div className="flex flex-row justify-start gap-2">
      {fields.map(({ field, label, suffix }) => (
        <PrefixSuffixInput
          defaultValue={field?.toString() || '0'}
          key={label}
          label={label}
          optional={true}
          readonly={!editable}
          suffix={suffix}
          type="number"
        />
      ))}
    </div>
  )
}

type WindConstraintControlsProps = ConstraintControlsProps<WindConstraint>

function WindConstraintControls({
  constraint,
  editable,
}: WindConstraintControlsProps) {
  const fields = [
    {
      field: constraint.directionTolerance,
      label: 'Direction tolerance',
      suffix: 'degrees',
    },
    { field: constraint.maxGustSpeed, label: 'Max gust speed', suffix: 'm/s' },
    { field: constraint.maxSpeed, label: 'Max speed', suffix: 'm/s' },
    { field: constraint.minSpeed, label: 'Min speed', suffix: 'm/s' },
  ]
  return (
    <div className="flex flex-row justify-start gap-2">
      {fields.map(({ field, label, suffix }) => (
        <PrefixSuffixInput
          defaultValue={field?.toString() || '0'}
          key={label}
          label={label}
          optional={true}
          readonly={!editable}
          suffix={suffix}
          type="number"
        />
      ))}
    </div>
  )
}
