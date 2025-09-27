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
import { useState } from 'react'
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
  const [zodErrors, setZodErrors] = useState<z.ZodError | null>(null)
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
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = methods

  const { fields, remove, prepend } = useFieldArray({
    control,
    name: 'activities',
  })

  const onSubmit = (data: TInputActivities) => {
    const result = InputActivities.safeParse(data)
    if (!result.success) {
      setZodErrors(result.error)
      logger.error('zod validation failed', { zodErrors })
    } else {
      logger.warn('saving zod activities', {
        data: InputActivities.safeParse(data),
      })
      setActivitiesAction(data.activities)
      reset(data)
    }
  }

  const hasErrors = Object.keys(errors).length !== 0

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-base-100 mb-4 flex flex-row items-center justify-between">
            <div>
              <SettingTitle title={'Activity Settings'} />
              <div className="text-md px-4">
                You cannot edit global activities
                {hasErrors && (
                  <div className="text-error text-xs italic">
                    Please fix the errors below
                    {zodErrors && (
                      <pre>
                        {JSON.stringify(z.treeifyError(zodErrors), null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
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
          {hasErrors && !zodErrors && (
            <pre
              className={
                'text-error rounded-box bg-base-200 m-4 max-h-48 overflow-y-scroll p-2 font-mono text-xs'
              }
            >
              {JSON.stringify(errors.activities, null, 2)}
            </pre>
          )}
          <ActivityArray fields={fields} removeByIndex={remove} />
        </form>
      </FormProvider>
    </div>
  )
}
