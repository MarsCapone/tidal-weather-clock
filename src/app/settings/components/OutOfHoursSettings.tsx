import { SettingCard, SettingTitle } from '@/app/settings/components/common'
import { Input } from '@/app/settings/components/form'
import { useWorkingHours, WorkingHoursSetting } from '@/hooks/settings'
import { tzOffset } from '@date-fns/tz'
import { shallowEqual } from 'fast-equals'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

type WorkingHoursForm = {
  startHour: string
  endHour: string
  enabled: boolean
}

export default function OutOfHoursSettings() {
  const [workingHours, updateWorkingHours, setWorkingHours] = useWorkingHours()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WorkingHoursForm>()
  useEffect(() => {
    setValue('startHour', getTimeString(workingHours.startHour))
    setValue('endHour', getTimeString(workingHours.endHour))
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
        ? getFractionalTime(data.startHour)
        : workingHours.startHour
    const endHour =
      data.endHour !== undefined
        ? getFractionalTime(data.endHour)
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
    updateWorkingHours(newVal)
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
                defaultValue: getTimeString(workingHours.startHour),
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
                defaultValue: getTimeString(workingHours.endHour),
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

type TimeInputProps = {
  title: string
  fractionalTime: number
  setFractionalTime: (ft: number) => void
  placeholder?: string
}

function TimeInput({
  title,
  fractionalTime,
  setFractionalTime,
  placeholder,
}: TimeInputProps) {
  return <div></div>
}

const getTimeString = (fractionalTime: number | null): string => {
  if (fractionalTime === null) {
    return '00:00'
  }

  // this time is in UTC, but we need to convert it to the local time for display
  // result is minutes, so divide by 60 to get hours
  const timeZoneOffset = tzOffset('Europe/London', new Date()) / 60

  const hours = Math.floor(fractionalTime + timeZoneOffset)
  const minutes = (fractionalTime + timeZoneOffset - hours) * 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const getFractionalTime = (timeString: string) => {
  // users will enter this data according to their experience of a day, but
  // we need to save it as UTC. so we need to work out what timezone we are
  // in, then subtract that diff from whichever numbers are given

  const [hours, minutes] = timeString.split(':')
  const fractionalTime = Number.parseInt(hours) + Number.parseInt(minutes) / 60

  // this should return the minutes ahead of UTC the current time is
  const timeZoneOffset = tzOffset('Europe/London', new Date())
  return fractionalTime - timeZoneOffset / 60
}
