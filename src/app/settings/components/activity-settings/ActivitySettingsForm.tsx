'use client'

import { SettingTitle } from '@/app/settings/components/common'
import { Activity } from '@/lib/types/activity'
import { PlusIcon } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useFieldArray, useForm } from 'react-hook-form'
import ActivityArray from '@/app/settings/components/activity-settings/ActivityArray'
import { InputActivities } from '@/app/settings/components/activity-settings/types'

export type ActivitySettingsFormProps = {
  userId: string
  activities: Activity[]
  setActivitiesAction: (activities: Activity[]) => void
}
export default function ActivitySettingsForm({
  userId,
  activities,
  setActivitiesAction,
}: ActivitySettingsFormProps) {
  const defaultValues = {
    activities,
  }
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<InputActivities>({
    defaultValues,
  })

  const { fields, remove, prepend } = useFieldArray({
    control,
    name: 'activities',
  })

  const onSubmit = (data) => console.log(data)

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-base-100 sticky top-10 mb-4 flex flex-row items-center justify-between">
          <SettingTitle title={'Activity Settings'} />
          <div className="flex gap-2">
            <button
              className="btn btn-primary rounded-field"
              onClick={() =>
                prepend({
                  id: uuidv4(),
                  name: 'Sample Activity',
                  description: 'description here',
                  priority: 5,
                  scope: 'user',
                  constraints: [],
                })
              }
            >
              Add Activity <PlusIcon className="h-4 w-4" />
            </button>
            <button
              type={'submit'}
              className={`btn btn-secondary rounded-field ${isDirty ? '' : 'btn-disabled'}`}
            >
              Save Changes
            </button>
          </div>
        </div>
        <ActivityArray
          control={control}
          register={register}
          fields={fields}
          removeByIndex={remove}
          getByIndex={(i) => getValues(`activities.${i}`)}
        />
      </form>
    </div>
  )
}
