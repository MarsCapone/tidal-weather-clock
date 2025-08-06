'use client'

import { SettingTitle } from '@/app/settings/components/common'
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
import { JsonEditor, JsonEditorProps } from 'json-edit-react'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

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
        id: uuidv4(),
        name: 'Sample name',
        description: 'Sample description',
        priority: 0,
        constraints: [],
      },
      ...activities,
    ])
  }

  const setActivityFactory = (index: number) => {
    return (activity: Activity) => {
      const newActivities = [...activities]
      newActivities[index] = activity
      setActivities(newActivities)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <SettingTitle title={'Activity Settings'} />
        <button className="btn btn-primary rounded-field" onClick={addActivity}>
          Add Activity <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      {activities.map((activity, index) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          setActivity={setActivityFactory(index)}
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
  setActivity: (activity: Activity) => void
  onDelete: () => void
}

function ActivityCard({ activity, setActivity, onDelete }: ActivityCardProps) {
  return (
    <div className="card card-lg my-2 shadow-sm">
      <div className="card-body">
        <div className="card-title flex flex-row justify-between">
          <div className="flex-1">
            <div className="text-lg">{activity.name}</div>
          </div>
          <div className="tooltip tooltip-bottom" data-tip="Delete activity">
            <button
              className="btn btn-ghost hover:btn-error rounded-field aspect-square p-1"
              onClick={onDelete}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <div>{activity.description}</div>
        </div>
        <div className="flex flex-col gap-2">
          <JsonEditor
            data={activity}
            setData={setActivity as JsonEditorProps['setData']}
          />
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
  onDelete: () => void
}

function ActivityConstraint({
  constraint,
  constraintId,
  editable,
  onDelete,
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
      <div className="flex flex-row justify-between gap-2">
        <div className={'flex-1 text-sm font-bold'}>
          {capitalize(constraint.type)} Constraint
        </div>
        <div className="badge badge-info ml-4 font-mono text-xs font-thin">
          {constraintId}
        </div>
        <button
          className="btn btn-xs hover:btn-error rounded-box"
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
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
