'use client'

import ActivityArray from '@/app/settings/components/activity-settings/ActivityArray'
import { InputActivities } from '@/app/settings/components/activity-settings/types'
import { SettingCard, SettingTitle } from '@/app/settings/components/common'
import { TActivity } from '@/lib/types/TActivity'
import logger from '@/lib/utils/logger'
import { mpsToKnots } from '@/lib/utils/units'
import { PlusIcon } from 'lucide-react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

export type ActivitySettingsFormProps = {
  userId: string
  activities: TActivity[]
  setActivitiesAction: (activities: TActivity[]) => void
}
export default function ActivitySettingsForm({
  activities,
  setActivitiesAction,
}: ActivitySettingsFormProps) {
  const defaultValues = {
    // when items are saved, they are converted to the correct unit, but we need to represent them
    // in the display unit first
    activities: activities.map((activity) => ({
      ...activity,
      constraints: activity.constraints.map((constraint) => {
        if (constraint.type === 'wind') {
          return {
            ...constraint,
            // convert wind speeds to knots
            minSpeed: constraint.minSpeed
              ? mpsToKnots(constraint.minSpeed)
              : undefined,
            maxSpeed: constraint.maxSpeed
              ? mpsToKnots(constraint.maxSpeed)
              : undefined,
            maxGustSpeed: constraint.maxGustSpeed
              ? mpsToKnots(constraint.maxGustSpeed)
              : undefined,
          }
        }
        return constraint
      }),
    })),
  }
  const methods = useForm<InputActivities>({
    defaultValues,
  })
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods

  const { fields, remove, prepend } = useFieldArray({
    control,
    name: 'activities',
  })

  const onSubmit = (data: InputActivities) => {
    logger.info('setting activities', data)
    setActivitiesAction(data.activities)
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-base-100 mb-4 flex flex-row items-center justify-between">
            <div>
              <SettingTitle title={'Activity Settings'} />
              <div className="text-md px-4 italic">
                You cannot edit global activities
              </div>
            </div>
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
          <SettingCard>
            {errors.activities && (
              <div className="alert alert-error">
                <span>{JSON.stringify(errors)}</span>
              </div>
            )}
            <ActivityArray fields={fields} removeByIndex={remove} />
          </SettingCard>
        </form>
      </FormProvider>
    </div>
  )
}
