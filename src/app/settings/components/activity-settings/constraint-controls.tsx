import { UseFormRegister } from 'react-hook-form'
import { InputActivities } from '@/app/settings/components/activity-settings/types'
import {
  Input,
  NamedFormComponent,
} from '@/app/settings/components/common/form'
import { Constraint } from '@/lib/types/activity'
import { knotsToMps, mpsToKnots } from '@/lib/utils/units'

type ControlsProps = {
  register: UseFormRegister<InputActivities>
  activityIndex: number
  constraintIndex: number
  disabled: boolean
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
  disabled,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }

  return (
    <div>
      <div className={'grid grid-cols-3 gap-x-4'}>
        <WindSpeedInput
          title={'Min wind speed'}
          register={register}
          target={getTarget('minSpeed')}
          disabled={disabled}
        />
        <WindSpeedInput
          title={'Max wind speed'}
          register={register}
          target={getTarget('maxSpeed')}
          disabled={disabled}
        />
        <WindSpeedInput
          title={'Max gust speed'}
          register={register}
          target={getTarget('maxGustSpeed')}
          disabled={disabled}
        />
      </div>
      <div className={'grid grid-cols-2 gap-x-4'}>
        <Input
          title={'Direction tolerance (º)'}
          suffix={
            'Acceptable angle off the wind the match the preferred direction'
          }
          className={'input input-sm'}
          inputProps={{
            ...register(getTarget('maxGustSpeed')),
            type: 'float',
            disabled,
          }}
        />
        <Input
          title={'Preferred directions'}
          suffix={'List of preferred wind directions (origin) in degrees'}
          className={'input input-sm'}
          inputProps={{
            ...register(getTarget('maxGustSpeed')),
            type: 'float',
            disabled,
          }}
        />
      </div>
    </div>
  )
}
export function WeatherConstraintControls({
  register,
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return (
    <div className={'grid grid-cols-2 gap-x-4'}>
      <Input
        title={'Min temperature (ºC)'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('minTemperature')),
          type: 'float',
          disabled,
        }}
      />
      <Input
        title={'Max temperature (ºC)'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxTemperature')),
          type: 'float',
          disabled,
        }}
      />
      <Input
        title={'Max UV Index'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxUvIndex')),
          type: 'float',
          disabled,
        }}
      />
      <Input
        title={'Max cloud cover (%)'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxCloudCover')),
          type: 'float',
          disabled,
        }}
      />
      <Input
        title={'Max likelihood of rain'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxPrecipitationProbability')),
          type: 'float',
          disabled,
        }}
      />
    </div>
  )
}
export function TideConstraintControls({
  register,
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return (
    <div>
      <div className={'grid grid-cols-2 gap-x-4'}>
        <Input
          title={'Min height (m)'}
          className={'input input-sm'}
          inputProps={{
            ...register(getTarget('minHeight')),
            type: 'float',
            disabled,
          }}
        />
        <Input
          title={'Max height (m)'}
          className={'input input-sm'}
          inputProps={{
            ...register(getTarget('maxHeight')),
            type: 'float',
            disabled,
          }}
        />
      </div>
      <NamedFormComponent
        title={'Time from tidal event'}
        className={'grid grid-cols-3 gap-x-4'}
      >
        <NamedFormComponent title={'Tide Type'}>
          <label className={'label'}>
            Low
            <input
              type="radio"
              value={'low'}
              className="radio radio-primary"
              disabled={disabled}
              {...register(
                `activities.${activityIndex}.constraints.${constraintIndex}.timeFromTideEvent.event`,
              )}
            />
            <input
              type="radio"
              value={'high'}
              className="radio radio-primary"
              disabled={disabled}
              {...register(
                `activities.${activityIndex}.constraints.${constraintIndex}.timeFromTideEvent.event`,
              )}
            />
            High
          </label>
        </NamedFormComponent>
        <Input
          title={'Max hours before'}
          className={'input input-sm'}
          inputProps={{
            type: 'float',
            min: 0,
            max: 12,
            ...register(
              `activities.${activityIndex}.constraints.${constraintIndex}.timeFromTideEvent.maxHoursBefore`,
            ),
            disabled,
          }}
        />
        <Input
          title={'Max hours after'}
          className={'input input-sm'}
          inputProps={{
            type: 'float',
            min: 0,
            max: 12,
            ...register(
              `activities.${activityIndex}.constraints.${constraintIndex}.timeFromTideEvent.maxHoursAfter`,
            ),
            disabled,
          }}
        />
      </NamedFormComponent>
    </div>
  )
}

export function SunConstraintControls({
  register,
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }

  return (
    <div className={'grid grid-cols-2 grid-rows-2 gap-x-4'}>
      <Input
        title={'Requires Daylight'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('requiresDaylight')),
          type: 'checkbox',
          disabled,
        }}
      />
      <Input
        title={'Requires Darkness'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('requiresDarkness')),
          type: 'checkbox',
          disabled,
        }}
      />

      <Input
        title={'Max hours before sunset'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxHoursBeforeSunset')),
          type: 'float',
          min: 0,
          max: 12,
          disabled,
        }}
      />
      <Input
        title={'Min hours after sunrise'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('minHoursAfterSunrise')),
          type: 'float',
          min: 0,
          max: 12,
          disabled,
        }}
      />
    </div>
  )
}

export function TimeConstraintControls({
  register,
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return (
    <div className={'grid grid-cols-2'}>
      <Input
        title={'Earliest Hour'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('earliestHour')),
          type: 'float',
          min: 0,
          max: 24,
          disabled,
        }}
      />
      <Input
        title={'Latest Hour'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('latestHour')),
          type: 'float',
          min: 0,
          max: 24,
          disabled,
        }}
      />
      <Input
        title={'Ignore working hours setting'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('ignoreWorkingHours')),
          type: 'checkbox',
          disabled,
        }}
      />
      <Input
        title={'Preferred hours'}
        suffix={'List of preferred hours for doing this activity'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('preferredHours')),
          type: 'float',
          min: 0,
          max: 24,
          disabled,
        }}
      />
    </div>
  )
}
export function DayConstraintControls({
  register,
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }
  return (
    <div className={'grid grid-cols-2'}>
      <Input
        title={'Weekday?'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('isWeekday')),
          type: 'checkbox',
          disabled,
        }}
      />
      <Input
        title={'Weekend?'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('isWeekend')),
          type: 'checkbox',
          disabled,
        }}
      />

      <Input
        title={'Dates'}
        suffix={'List of date ranges to do this activity'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('dateRanges')),
          disabled,
        }}
      />
    </div>
  )
}

function WindSpeedInput({
  title,
  register,
  target,
  disabled,
}: {
  title: string
  register: UseFormRegister<InputActivities>
  target: RegisterParams[0]
  disabled: boolean
}) {
  return (
    <Input
      title={title}
      suffix={'knots'}
      className={'input input-sm'}
      inputProps={{
        ...register(target, {
          setValueAs: (value) => knotsToMps(value),
        }),
        type: 'float',
        disabled,
      }}
    />
  )
}
