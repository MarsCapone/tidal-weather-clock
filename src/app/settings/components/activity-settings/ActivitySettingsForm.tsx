'use client'

import ActivityArray from '@/app/settings/components/activity-settings/ActivityArray'
import {
  InputActivities,
  TInputActivities,
} from '@/app/settings/components/activity-settings/types'
import { SettingTitle } from '@/app/settings/components/common'
import SettingButton from '@/app/settings/components/common/SettingButton'
import { TActivity } from '@/lib/types/activity'
import logger from '@/lib/utils/logger'
import { mpsToKnots } from '@/lib/utils/units'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import * as z from 'zod'

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
  const methods = useForm<
    z.input<typeof InputActivities>,
    unknown,
    z.output<typeof InputActivities>
  >({
    defaultValues,
    resolver: zodResolver(InputActivities),
  })
  const { reset, control, handleSubmit } = methods

  const { fields, remove, prepend } = useFieldArray({
    control,
    name: 'activities',
  })

  const onSubmit = (data: TInputActivities) => {
    const result = InputActivities.safeParse(data)
    if (!result.success) {
      logger.error('zod validation failed', { zodErrors: result.error })
    } else {
      logger.warn('saving zod activities', {
        data: InputActivities.safeParse(data),
      })
      setActivitiesAction(data.activities)
      reset(data)
    }
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-base-100 mb-4 flex flex-row items-center justify-between">
            <div>
              <SettingTitle title={'Activity Settings'} />
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <SettingButton
                type={'button'}
                className={'btn-primary'}
                disabled={false}
                onClick={() =>
                  prepend({
                    id: uuidv4(),
                    name: 'Sample Activity',
                    description: 'description here',
                    priority: 5,
                    scope: 'user',
                    constraints: [],
                    ignoreOoh: false,
                    version: 0,
                  })
                }
              >
                Add Activity <PlusIcon className="h-4 w-4" />
              </SettingButton>
              <SettingButton
                type={'submit'}
                // disabled={!isDirty}
                className={'btn-secondary'}
              >
                Save Changes
              </SettingButton>
            </div>
          </div>
          <ActivityArray fields={fields} removeByIndex={remove} />
        </form>
      </FormProvider>
    </div>
  )
}
