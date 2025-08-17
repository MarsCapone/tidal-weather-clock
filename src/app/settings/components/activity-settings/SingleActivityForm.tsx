import {
  Control,
  useFieldArray,
  UseFormGetValues,
  UseFormRegister,
} from 'react-hook-form'
import { Input } from '@/app/settings/components/common/form'
import { InputActivities } from '@/app/settings/components/activity-settings/types'

type FieldArrayProps = {
  index: number
  control: Control<InputActivities>
  register: UseFormRegister<InputActivities>
  getValues: UseFormGetValues<InputActivities>
}

type SingleActivityFormProps = FieldArrayProps

export default function SingleActivityForm({
  index,
  control,
  register,
  getValues,
}: SingleActivityFormProps) {
  return (
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
        getValues={getValues}
      />
    </div>
  )
}

type ConstraintFormProps = FieldArrayProps

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
