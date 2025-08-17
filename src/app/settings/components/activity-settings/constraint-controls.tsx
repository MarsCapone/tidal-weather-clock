import { UseFormRegister } from 'react-hook-form'
import { InputActivities } from '@/app/settings/components/activity-settings/types'
import { Input } from '@/app/settings/components/common/form'
import { Constraint } from '@/lib/types/activity'

type ControlsProps = {
  register: UseFormRegister<InputActivities>
  activityIndex: number
  constraintIndex: number
}

type RegisterParams = Parameters<ControlsProps['register']>
type KeysOfUnion<T> = T extends T ? keyof T : never
type ConstraintKey = KeysOfUnion<Constraint>

const makeRegisterTarget = (
  key: ConstraintKey,
  ai: number,
  ci: number,
): RegisterParams[0] => `activities.${ai}.constraints.${ci}.${key}`

export function WindConstraintControls({
  register,
  activityIndex,
  constraintIndex,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }

  return <div className={'grid grid-cols-2'}></div>
}
export function WeatherConstraintControls({
  register,
  activityIndex,
  constraintIndex,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return <div className={'grid grid-cols-2'}></div>
}
export function TideConstraintControls({
  register,
  activityIndex,
  constraintIndex,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return <div className={'grid grid-cols-2'}></div>
}

export function SunConstraintControls({
  register,
  activityIndex,
  constraintIndex,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }

  return (
    <div className={'grid grid-cols-2 grid-rows-2'}>
      <Input
        title={'Requires Daylight'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('requiresDaylight')),
          type: 'checkbox',
        }}
      />
      <Input
        title={'Requires Darkness'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('requiresDarkness')),
          type: 'checkbox',
        }}
      />

      <Input
        title={'Max hours before sunset'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxHoursBeforeSunset')),
          type: 'number',
          min: 0,
          max: 12,
        }}
      />
      <Input
        title={'Min hours after sunrise'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('minHoursAfterSunrise')),
          type: 'number',
          min: 0,
          max: 12,
        }}
      />
    </div>
  )
}

export function TimeConstraintControls({
  register,
  activityIndex,
  constraintIndex,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return <div className={'grid grid-cols-2'}></div>
}
export function DayConstraintControls({
  register,
  activityIndex,
  constraintIndex,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return <div className={'grid grid-cols-2'}></div>
}
