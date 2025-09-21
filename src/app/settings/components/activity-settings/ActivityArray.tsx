import {
  DayConstraintControls,
  SunConstraintControls,
  TideConstraintControls,
  TimeConstraintControls,
  WeatherConstraintControls,
  WindConstraintControls,
} from '@/app/settings/components/activity-settings/constraint-controls'
import PrioritySelector from '@/app/settings/components/activity-settings/PrioritySelector'
import {
  InputActivities,
  TInputActivities,
} from '@/app/settings/components/activity-settings/types'
import { Input } from '@/app/settings/components/common/form'
import SettingButton from '@/app/settings/components/common/SettingButton'
import { DarkModeContext } from '@/lib/utils/contexts'
import { ErrorMessage } from '@hookform/error-message'
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
import React, { useContext } from 'react'
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import * as z from 'zod'

type ActivityArrayProps = {
  fields: FieldArrayWithId<z.input<typeof InputActivities>>[]
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
          <li key={`activity-${item.id}`} className={'mb-4'}>
            <SingleActivity index={index} removeByIndex={removeByIndex} />
          </li>
        )
      })}
    </ul>
  )
}

function SingleActivity({ removeByIndex, index }: SingleActivityProps) {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<TInputActivities>()
  const activity = getValues(`activities.${index}`)
  const disabled = activity.scope === 'global'
  return (
    <div className={'card card-lg shadow-base-300 rounded-box p-4 shadow-lg'}>
      <div className={'mb-4 flex flex-row items-end gap-4'}>
        <div className={'w-full'}>
          <Input
            title={'Activity Name'}
            className={'input input-md w-full'}
            inputProps={{
              ...register(`activities.${index}.name`),
              disabled,
            }}
          />
          <ErrorMessage name={`activities.${index}.name`} errors={errors} />
        </div>
        <button
          className={'btn btn-md btn-soft rounded-field btn-error mb-1'}
          onClick={() => removeByIndex(index)}
        >
          <Trash2Icon className={'h-6 w-6'} />
        </button>
      </div>
      <div className={'mb-4 flex flex-col items-center gap-2 sm:flex-row'}>
        <div className="w-full">
          <Input
            title={'Description'}
            className={'textarea textarea-md'}
            inputProps={{
              ...register(`activities.${index}.description`),
              disabled,
              type: 'textarea',
            }}
          />
          <ErrorMessage
            name={`activities.${index}.description`}
            errors={errors}
          />
        </div>
        <PrioritySelector
          disabled={disabled}
          {...register(`activities.${index}.priority`)}
        >
          <ErrorMessage name={`activities.${index}.priority`} errors={errors} />
        </PrioritySelector>
      </div>
      <ConstraintArray index={index} disabled={disabled} />
      <div
        className={
          'flex flex-row items-center justify-between gap-2 text-xs font-thin'
        }
      >
        <span>id:{activity.id}</span>
        <button
          className={'btn btn-xs btn-soft rounded-field'}
          onClick={() => removeByIndex(index)}
        >
          Delete Activity <Trash2Icon className={'h-4 w-4'} />
        </button>
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
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
  const { fields, remove, prepend } = useFieldArray({
    control,
    name: `activities.${index}.constraints`,
  })

  return (
    <div>
      <div className={'mb-4 flex flex-row items-center justify-between gap-4'}>
        <div className={'text-md'}>
          Constraints
          <div className={'text-error text-xs'}>
            <ErrorMessage
              name={`activities.${index}.constraints`}
              errors={errors}
            />
          </div>
        </div>
        {!disabled && (
          <SettingButton
            className={'md:btn-sm btn-primary'}
            onClick={() => prepend({ type: 'wind' })}
          >
            Add Constraint <PlusIcon className="h-4 w-4" />
          </SettingButton>
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
