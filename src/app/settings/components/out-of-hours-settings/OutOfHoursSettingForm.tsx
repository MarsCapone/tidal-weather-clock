'use client'

import { SettingCard, SettingTitle } from '@/app/settings/components/common'
import { Input } from '@/app/settings/components/common/form'
import SettingButton from '@/app/settings/components/common/SettingButton'
import { WorkingHoursSetting } from '@/lib/types/settings'
import {
  fractionalUtcToLocalTimeString,
  localTimeStringToFractionalUtc,
} from '@/lib/utils/dates'
import { SubmitHandler, useForm } from 'react-hook-form'

type WorkingHoursForm = {
  startHour: string
  endHour: string
  enabled: boolean
}

export type OutOfHoursSettingFormProps = {
  workingHours: WorkingHoursSetting
  setWorkingHoursAction: (workingHours: WorkingHoursSetting) => void
}

export default function OutOfHoursSettingForm({
  workingHours,
  setWorkingHoursAction,
}: OutOfHoursSettingFormProps) {
  const workingHoursDisplay: WorkingHoursForm = {
    startHour: fractionalUtcToLocalTimeString(workingHours.startHour),
    endHour: fractionalUtcToLocalTimeString(workingHours.endHour),
    enabled: workingHours.enabled,
  }
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<WorkingHoursForm>({
    defaultValues: workingHoursDisplay,
  })

  const onSubmit: SubmitHandler<WorkingHoursForm> = (data) => {
    setWorkingHoursAction({
      startHour: localTimeStringToFractionalUtc(data.startHour),
      endHour: localTimeStringToFractionalUtc(data.endHour),
      enabled: data.enabled,
    })
    reset(data)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 flex flex-row items-center justify-between">
          <SettingTitle title={'Out of Hours'} />
          <SettingButton
            type={'submit'}
            disabled={!isDirty}
            className={'btn-primary'}
          >
            Save Changes
          </SettingButton>
        </div>
        <div>Do not suggest activities outside of these hours.</div>
        <SettingCard>
          <div className="flex flex-row gap-4">
            <Input
              title={'Start time'}
              className="input w-36"
              inputProps={{
                type: 'time',
                ...register('startHour', {}),
              }}
              suffix={
                <span>
                  Optional
                  {errors.startHour && (
                    <span className="text-error">
                      {errors.startHour.message}
                    </span>
                  )}
                </span>
              }
            />
            <Input
              title={'End time'}
              className="input w-36"
              inputProps={{
                type: 'time',
                ...register('endHour', {}),
              }}
              suffix={
                <span>
                  Optional
                  {errors.endHour && (
                    <span className="text-error">{errors.endHour.message}</span>
                  )}
                </span>
              }
            />
            <Input
              title={'Enable?'}
              className="toggle"
              inputProps={{
                type: 'checkbox',
                ...register('enabled'),
              }}
              suffix={
                errors.enabled && (
                  <span className="text-error">{errors.enabled.message}</span>
                )
              }
            />
          </div>
        </SettingCard>
      </form>
    </div>
  )
}
