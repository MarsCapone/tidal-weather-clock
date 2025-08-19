'use client'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import {
  fractionalUtcToLocalTimeString,
  localTimeStringToFractionalUtc,
} from '@/lib/utils/dates'
import { shallowEqual } from 'fast-equals'
import { SettingCard, SettingTitle } from '@/app/settings/components/common'
import { Input } from '@/app/settings/components/common/form'
import { WorkingHoursSetting } from '@/lib/types/settings'

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
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WorkingHoursForm>()
  useEffect(() => {
    setValue(
      'startHour',
      fractionalUtcToLocalTimeString(workingHours.startHour),
    )
    setValue('endHour', fractionalUtcToLocalTimeString(workingHours.endHour))
    setValue('enabled', workingHours.enabled)
  }, [
    workingHours.startHour,
    workingHours.endHour,
    workingHours.enabled,
    setValue,
  ])
  const current = watch()

  const getNewWorkingHoursSetting = (
    data: WorkingHoursForm,
  ): WorkingHoursSetting => {
    const startHour =
      data.startHour !== undefined
        ? localTimeStringToFractionalUtc(data.startHour)
        : workingHours.startHour
    const endHour =
      data.endHour !== undefined
        ? localTimeStringToFractionalUtc(data.endHour)
        : workingHours.endHour
    const enabled =
      data.enabled !== undefined ? data.enabled : workingHours.enabled
    return {
      startHour,
      endHour,
      enabled,
    }
  }

  const isDifferent = !shallowEqual(
    getNewWorkingHoursSetting(current),
    workingHours,
  )

  const onSubmit: SubmitHandler<WorkingHoursForm> = (data) => {
    const newVal = getNewWorkingHoursSetting(data)
    setWorkingHoursAction(newVal)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 flex flex-row items-center justify-between">
          <SettingTitle title={'Out of Hours'} />
          <button
            type="submit"
            className={`btn rounded-field ${isDifferent ? 'btn-primary' : 'btn-disabled'}`}
          >
            Save Changes
          </button>
        </div>
        <div>Do not suggest activities outside of these hours.</div>
        <SettingCard>
          <div className="flex flex-row gap-4">
            <Input
              title={'Start time'}
              className="input w-36"
              inputProps={{
                type: 'time',
                defaultValue: fractionalUtcToLocalTimeString(
                  workingHours.startHour,
                ),
                ...register('startHour'),
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
                defaultValue: fractionalUtcToLocalTimeString(
                  workingHours.endHour,
                ),
                ...register('endHour'),
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
                defaultChecked: workingHours.enabled,
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
