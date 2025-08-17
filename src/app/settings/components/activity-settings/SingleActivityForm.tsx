import {
  Control,
  FieldArrayWithId,
  useFieldArray,
  UseFormGetValues,
  UseFormRegister,
} from 'react-hook-form'
import { Input } from '@/app/settings/components/common/form'
import { InputActivities } from '@/app/settings/components/activity-settings/types'

type ActivityArrayProps = {
  fields: FieldArrayWithId<InputActivities>[]
  control: Control<InputActivities>
  register: UseFormRegister<InputActivities>
  removeByIndex: (i: number) => void
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
}: ActivityArrayProps) {
  return (
    <ul>
      {fields.map((item, index) => {
        return (
          <li key={item.id}>
            <div>
              <Input
                title={'Activity Name'}
                className={''}
                inputProps={{ ...register(`activities.${index}.name`) }}
              />
              <Input
                title={'Description'}
                className={''}
                inputProps={{ ...register(`activities.${index}.description`) }}
              />
              <ConstraintForm
                index={index}
                control={control}
                register={register}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function ConstraintForm({ index, control, register }: ConstraintFormProps) {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `activities.${index}.constraints`,
  })

  return (
    <div>
      {fields.map((item, k) => (
        <div key={item.id}>
          <Input
            title={'Type'}
            className={''}
            inputProps={{
              ...register(`activities.${index}.constraints.${k}.type`),
            }}
          />
          <button className={'btn'} onClick={() => remove(k)}>
            Delete Constraint
          </button>
        </div>
      ))}

      <button className={'btn'} onClick={() => append({ type: 'sun' })}>
        Add constraint
      </button>
    </div>
  )
}
