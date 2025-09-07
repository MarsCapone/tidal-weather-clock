import {
  DayConstraintControls,
  SunConstraintControls,
  TideConstraintControls,
  TimeConstraintControls,
  WeatherConstraintControls,
  WindConstraintControls,
} from '@/app/settings/components/activity-settings/constraint-controls'
import { InputActivities } from '@/app/settings/components/activity-settings/types'
import { Input } from '@/app/settings/components/common/form'
import {
  Calendar1Icon,
  ClockIcon,
  CloudIcon,
  GlassWaterIcon,
  PlusIcon,
  SunIcon,
  Trash2Icon,
  WindIcon,
} from 'lucide-react'
import React from 'react'
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'

type ActivityArrayProps = {
  fields: FieldArrayWithId<InputActivities>[]
  removeByIndex: (i: number) => void
}

type ConstraintFormProps = {
  index: number
  disabled: boolean
}

type SingleActivityProps = {
  index: number
  removeByIndex: (i: number) => void
}

export default function ActivityArray({
  fields,
  removeByIndex,
}: ActivityArrayProps) {
  return (
    <ul>
      {fields.map((item, index) => {
        return (
          <li key={`activity-${item.id}`}>
            <SingleActivity index={index} removeByIndex={removeByIndex} />
            <div className={'divider'}></div>
          </li>
        )
      })}
    </ul>
  )
}

function SingleActivity({ removeByIndex, index }: SingleActivityProps) {
  const { register, getValues } = useFormContext<InputActivities>()
  const activity = getValues(`activities.${index}`)
  const disabled = activity.scope === 'global'
  return (
    <div className={''}>
      <div className={'mb-4 flex flex-row items-end gap-4'}>
        <Input
          title={'Activity Name'}
          className={'input input-md w-full'}
          outerClassName={'flex-none'}
          inputProps={{
            ...register(`activities.${index}.name`),
            disabled,
          }}
        />
        <Input
          title={'Description'}
          className={'input input-md w-full'}
          outerClassName={'grow'}
          inputProps={{
            ...register(`activities.${index}.description`),
            disabled,
          }}
        />
        <Input
          title={'Priority'}
          className={'input input-md'}
          outerClassName={''}
          inputProps={{
            ...register(`activities.${index}.priority`),
            disabled,
            type: 'number',
            min: 1,
            max: 10,
          }}
        />
        {!disabled && (
          <button className={`my-2`} onClick={() => removeByIndex(index)}>
            <Trash2Icon className={'h-6 w-6'} />
          </button>
        )}
      </div>
      <ConstraintArray index={index} disabled={disabled} />
      <div
        className={
          'flex flex-row justify-end gap-2 font-mono text-xs font-thin'
        }
      >
        <span>id:{activity.id}</span>
        <span>scope:{activity.scope}</span>
      </div>
    </div>
  )
}

const constraintTypes = [
  { type: 'sun', label: 'Sun', Icon: SunIcon, Controls: SunConstraintControls },
  {
    type: 'time',
    label: 'Time',
    Icon: ClockIcon,
    Controls: TimeConstraintControls,
  },
  {
    type: 'day',
    label: 'Day',
    Icon: Calendar1Icon,
    Controls: DayConstraintControls,
  },
  {
    type: 'wind',
    label: 'Wind',
    Icon: WindIcon,
    Controls: WindConstraintControls,
  },
  {
    type: 'weather',
    label: 'Weather',
    Icon: CloudIcon,
    Controls: WeatherConstraintControls,
  },
  {
    type: 'tide',
    label: 'Tide',
    Icon: GlassWaterIcon,
    Controls: TideConstraintControls,
  },
]

function ConstraintArray({ index, disabled }: ConstraintFormProps) {
  const { control, register } = useFormContext<InputActivities>()
  const { fields, remove, prepend } = useFieldArray({
    control,
    name: `activities.${index}.constraints`,
  })

  return (
    <div>
      <div className={'mb-4 flex flex-row items-center justify-between gap-4'}>
        <div className={'text-md'}>Constraints</div>
        {!disabled && (
          <button
            className={'btn btn-sm rounded-field'}
            onClick={() => prepend({ type: 'wind' })}
          >
            Add Constraint <PlusIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <div>
        {fields.map((item, k) => (
          <div key={item.id} className={'mb-4'}>
            <div className={'tabs tabs-sm tabs-box w-full'}>
              {constraintTypes.map(({ type, label, Icon, Controls }, ci) => {
                return (
                  <React.Fragment key={ci}>
                    <label className={'tab mb-1 px-2'}>
                      <input
                        type="radio"
                        className={''}
                        value={type}
                        disabled={disabled}
                        {...register(
                          `activities.${index}.constraints.${k}.type`,
                        )}
                      />
                      <Icon className={'mr-1'} />
                      <span className={'hidden md:block'}>{label}</span>
                    </label>
                    <div
                      className={
                        'tab-content rounded-field bg-base-100 border-base-300 p-4'
                      }
                    >
                      <Controls
                        register={register}
                        activityIndex={index}
                        constraintIndex={k}
                        disabled={disabled}
                      />
                    </div>
                  </React.Fragment>
                )
              })}
              <div className={'grow'}></div>
              <div className={'flex flex-row justify-end gap-2'}>
                {!disabled && (
                  <button className={'px-2'} onClick={() => remove(k)}>
                    <Trash2Icon className={'h-4 w-4'} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
