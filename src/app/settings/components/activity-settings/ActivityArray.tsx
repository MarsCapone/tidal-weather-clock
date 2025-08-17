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

        return (
          <li key={item.id}>
            <div>
              <div className={'flex flex-row items-center gap-4'}>
                <Input
                  title={'Activity Name'}
                  outerClassName={'flex-none'}
                  inputProps={{ ...register(`activities.${index}.name`) }}
                />
                <Input
                  title={'Description'}
                  outerClassName={'grow'}
                  inputProps={{
                    ...register(`activities.${index}.description`),
                  }}
                />
                <Input
                  title={'Priority'}
                  outerClassName={''}
                  inputProps={{ type: 'number', min: 1, max: 10 }}
                />
                <button onClick={() => removeByIndex(index)}>
                  <Trash2Icon className={'h-6 w-6'} />
                </button>
              </div>
              <ConstraintForm
                index={index}
                control={control}
                register={register}
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
          </li>
        )
      })}
    </ul>
  )
}

const constraintTypes = [
  { type: 'sun', label: 'Sun', Icon: SunIcon, content: <div>sun inputs</div> },
  {
    type: 'time',
    label: 'Time',
    Icon: ClockIcon,
    content: <div>sun inputs</div>,
  },
  {
    type: 'day',
    label: 'Day',
    Icon: Calendar1Icon,
    content: <div>sun inputs</div>,
  },
  {
    type: 'wind',
    label: 'Wind',
    Icon: WindIcon,
    content: <div>sun inputs</div>,
  },
  {
    type: 'weather',
    label: 'Weather',
    Icon: CloudIcon,
    content: <div>sun inputs</div>,
  },
  {
    type: 'tide',
    label: 'Tide',
    Icon: GlassWaterIcon,
    content: <div>sun inputs</div>,
  },
]

function ConstraintForm({ index, control, register }: ConstraintFormProps) {
  const { fields, remove, prepend } = useFieldArray({
    control,
    name: `activities.${index}.constraints`,
  })

  return (
    <div>
      <div className={'mb-4 flex flex-row items-center justify-between gap-4'}>
        <div className={'text-md'}>Constraints</div>
        <button
          className={'btn btn-sm rounded-field'}
          onClick={() =>
            prepend({
              type: 'sun',
            })
          }
        >
          Add Constraint <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      <div>
        {fields.map((item, k) => (
          <div key={item.id} className={'mb-4'}>
            <div className={'tabs tabs-sm tabs-box w-full'}>
              {constraintTypes.map((c, ci) => {
                return (
                  <>
                    <label key={ci} className={'tab mb-1 px-2'}>
                      <input
                        type="radio"
                        className={''}
                        value={c.type}
                        {...register(
                          `activities.${index}.constraints.${k}.type`,
                        )}
                      />
                      <c.Icon className={'mr-1'} />
                      {c.label}
                    </label>
                    <div
                      className={
                        'tab-content rounded-field bg-base-100 border-base-300 p-4'
                      }
                    >
                      {c.content}
                    </div>
                  </>
                )
              })}
              <div className={'grow'}></div>
              <div className={'flex flex-row justify-end gap-2'}>
                <button className={'px-2'} onClick={() => remove(k)}>
                  <Trash2Icon className={'h-4 w-4'} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
