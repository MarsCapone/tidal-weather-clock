'use client'

import { SettingCard, SettingTitle } from '@/app/settings/components/common'
import {
  Fieldset,
  Input,
  PrefixSuffixInput,
} from '@/components/forms/FormComponents'
import { useActivities } from '@/hooks/apiRequests'
import {
  Activity,
  Constraint,
  SunConstraint,
  TideConstraint,
  TimeConstraint,
  WeatherConstraint,
  WindConstraint,
} from '@/types/activity'
import { DarkModeContext } from '@/utils/contexts'
import { fractionalUtcToLocalTimeString } from '@/utils/dates'
import logger from '@/utils/logger'
import { capitalize } from '@/utils/string'
import diff from 'diff-arrays-of-objects'
import {
  FilterFunction,
  githubDarkTheme,
  githubLightTheme,
  JsonEditor,
  JsonEditorProps,
} from 'json-edit-react'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function ActivitySettings() {
  const [activities, updateActivities] = useActivities([])
  const [internalActivities, setInternalActivities] = useState<Activity[]>([])

  // most operations will operate on internal activities, so we first reflect them here
  useEffect(() => {
    setInternalActivities(activities)
  }, [activities])

  const onDeleteActivity = (id: string) => {
    setInternalActivities(internalActivities.filter((item) => item.id !== id))
  }

  const addActivity = () => {
    setInternalActivities([
      {
        id: uuidv4(),
        name: 'Sample name',
        description: 'Sample description',
        priority: 0,
        constraints: [],
      },
      ...internalActivities,
    ])
  }

  const setActivityFactory = (index: number) => {
    return (activity: Activity) => {
      const newActivities = [...internalActivities]
      newActivities[index] = activity
      setInternalActivities(newActivities)
    }
  }

  // when we're ready, we can push our internal changes to the server
  const commitChanges = () => {
    updateActivities(internalActivities)
    logger.info('Pushing activities to server', {
      previousActivities: activities,
      newActivities: internalActivities,
    })
  }

  const changes = diff(activities, internalActivities, 'id')

  const changeCount =
    changes.added.length + changes.removed.length + changes.updated.length

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <SettingTitle title={'Activity Settings'} />
        <div className="flex gap-2">
          <button
            className="btn btn-primary rounded-field"
            onClick={addActivity}
          >
            Add Activity <PlusIcon className="h-4 w-4" />
          </button>
          <div className="indicator">
            {changeCount > 0 && (
              <span className="indicator-item badge badge-neutral">
                {changeCount}
              </span>
            )}
            <button
              className={`btn btn-secondary rounded-field ${changeCount === 0 ? 'btn-disabled' : ''}`}
              onClick={commitChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      {internalActivities.map((activity, index) => (
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

const restrictChanges = ({ key }: { key: string }) => {
  return key === 'id'
}

function ActivityCard({ activity, setActivity, onDelete }: ActivityCardProps) {
  const { isDarkMode } = useContext(DarkModeContext)

  const buttons = (
    <div className="tooltip tooltip-bottom" data-tip="Delete activity">
      <button
        className="btn btn-ghost hover:btn-error rounded-field aspect-square p-1"
        onClick={onDelete}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <SettingCard title={activity.name} buttons={buttons}>
      <div>
        <div>{activity.description}</div>
      </div>
      <div className="flex flex-col gap-2">
        <JsonEditor
          data={activity}
          setData={setActivity as JsonEditorProps['setData']}
          restrictAdd={true}
          restrictDelete={true}
          restrictEdit={restrictChanges as FilterFunction}
          theme={isDarkMode ? githubDarkTheme : githubLightTheme}
          rootName={''}
        />
      </div>
    </SettingCard>
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
        defaultValue={
          constraint.earliestHour
            ? fractionalUtcToLocalTimeString(constraint.earliestHour)
            : undefined
        }
        label="Earliest time"
        optional={true}
        readonly={!editable}
        type="time"
      />
      <PrefixSuffixInput
        defaultValue={
          constraint.latestHour
            ? fractionalUtcToLocalTimeString(constraint.latestHour)
            : undefined
        }
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
