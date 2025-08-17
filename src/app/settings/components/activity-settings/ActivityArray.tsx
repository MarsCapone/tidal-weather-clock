import {
  Control,
  FieldArrayWithId,
  useFieldArray,
  UseFormRegister,
} from 'react-hook-form'
import { Input } from '@/app/settings/components/common/form'
import { InputActivities } from '@/app/settings/components/activity-settings/types'
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
import { Activity } from '@/lib/types/activity'
import {
  DayConstraintControls,
  SunConstraintControls,
  WindConstraintControls,
  WeatherConstraintControls,
  TimeConstraintControls,
  TideConstraintControls,
} from '@/app/settings/components/activity-settings/constraint-controls'
import React from 'react'

type ActivityArrayProps = {
  fields: FieldArrayWithId<InputActivities>[]
  control: Control<InputActivities>
  register: UseFormRegister<InputActivities>
  removeByIndex: (i: number) => void
  getByIndex: (i: number) => Activity
}

type ConstraintFormProps = {
  index: number
  control: Control<InputActivities>
  register: UseFormRegister<InputActivities>
  disabled: boolean
}

export default function ActivityArray({
  fields,
  control,
  register,
  removeByIndex,
  getByIndex,
}: ActivityArrayProps) {
  return (
    <ul>
      {fields.map((item, index) => {
        const activity = getByIndex(index)
        const disabled = activity.scope === 'global'

        return (
          <li key={item.id}>
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
                  <button
                    className={`my-2`}
                    onClick={() => removeByIndex(index)}
                  >
                    <Trash2Icon className={'h-6 w-6'} />
                  </button>
                )}
              </div>
              <ConstraintForm
                index={index}
                control={control}
                register={register}
                disabled={disabled}
              />
              <div
                className={
                  'flex flex-row justify-end gap-2 font-mono text-xs font-thin'
                }
              >
                <span>id:{activity.id}</span>
                <span>scope:{activity.scope}</span>
              </div>
            </div>
            <div className={'divider'}></div>
          </li>
        )
      })}
    </ul>
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

function ConstraintForm({
  index,
  control,
  register,
  disabled,
}: ConstraintFormProps) {
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
            onClick={() => prepend({ type: 'tide' })}
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
