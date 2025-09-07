import { TInputActivities } from '@/app/settings/components/activity-settings/types'
import {
  Input,
  NamedFormComponent,
} from '@/app/settings/components/common/form'
import { Constraint } from '@/lib/types/activity'
import { knotsToMps } from '@/lib/utils/units'
import { ErrorMessage } from '@hookform/error-message'
import { useFormContext, UseFormRegister } from 'react-hook-form'

type ControlsProps = {
  activityIndex: number
  constraintIndex: number
  disabled: boolean
}

type RegisterParams = Parameters<UseFormRegister<TInputActivities>>
type KeysOfUnion<T> = T extends T ? keyof T : never
type ConstraintKey = KeysOfUnion<Constraint>

const makeRegisterTarget = (
  key: ConstraintKey,
  ai: number,
  ci: number,
): RegisterParams[0] => `activities.${ai}.constraints.${ci}.${key}`

export function WindConstraintControls({
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
  function getTarget(key: ConstraintKey) {
    return makeRegisterTarget(key, activityIndex, constraintIndex)
  }

  return (
    <div>
      <div className={'grid grid-cols-3 gap-x-4'}>
        <WindSpeedInput
          title={'Min wind speed'}
          target={getTarget('minSpeed')}
          disabled={disabled}
        />
        <WindSpeedInput
          title={'Max wind speed'}
          target={getTarget('maxSpeed')}
          disabled={disabled}
        />
        <WindSpeedInput
          title={'Max gust speed'}
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
        <ErrorMessage name={getTarget('maxGustSpeed')} errors={errors} />
        {/*<Input*/}
        {/*  title={'Preferred directions'}*/}
        {/*  suffix={'List of preferred wind directions (origin) in degrees'}*/}
        {/*  className={'input input-sm'}*/}
        {/*  inputProps={{*/}
        {/*    ...register(getTarget('preferredDirections')),*/}
        {/*    disabled,*/}
        {/*  }}*/}
        {/*/>*/}
        {/*<ErrorMessage name={getTarget('preferredDirections')} errors={errors} />*/}
      </div>
    </div>
  )
}
export function WeatherConstraintControls({
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
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
      <ErrorMessage name={getTarget('minTemperature')} errors={errors} />
      <Input
        title={'Max temperature (ºC)'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxTemperature')),
          type: 'float',
          disabled,
        }}
      />
      <ErrorMessage name={getTarget('maxTemperature')} errors={errors} />
      <Input
        title={'Max UV Index'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxUvIndex')),
          type: 'float',
          disabled,
        }}
      />
      <ErrorMessage name={getTarget('maxUvIndex')} errors={errors} />
      <Input
        title={'Max cloud cover (%)'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxCloudCover')),
          type: 'float',
          disabled,
        }}
      />
      <ErrorMessage name={getTarget('maxCloudCover')} errors={errors} />
      <Input
        title={'Max likelihood of rain'}
        className={'input input-sm'}
        inputProps={{
          ...register(getTarget('maxPrecipitationProbability')),
          type: 'float',
          disabled,
        }}
      />
      <ErrorMessage
        name={getTarget('maxPrecipitationProbability')}
        errors={errors}
      />
    </div>
  )
}
export function TideConstraintControls({
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
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
        <ErrorMessage name={getTarget('minHeight')} errors={errors} />
        <Input
          title={'Max height (m)'}
          className={'input input-sm'}
          inputProps={{
            ...register(getTarget('maxHeight')),
            type: 'float',
            disabled,
          }}
        />
        <ErrorMessage name={getTarget('maxHeight')} errors={errors} />
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
              {...register(getTarget('eventType'))}
            />
            <input
              type="radio"
              value={'high'}
              className="radio radio-primary"
              disabled={disabled}
              {...register(getTarget('eventType'))}
            />
            High
          </label>
        </NamedFormComponent>
        <ErrorMessage name={getTarget('eventType')} errors={errors} />
        <Input
          title={'Max hours before'}
          className={'input input-sm'}
          inputProps={{
            type: 'float',
            min: 0,
            max: 12,
            ...register(getTarget('maxHoursBefore')),
            disabled,
          }}
        />
        <ErrorMessage name={getTarget('maxHoursBefore')} errors={errors} />
        <Input
          title={'Max hours after'}
          className={'input input-sm'}
          inputProps={{
            type: 'float',
            min: 0,
            max: 12,
            ...register(getTarget('maxHoursAfter')),
            disabled,
          }}
        />
        <ErrorMessage name={getTarget('maxHoursAfter')} errors={errors} />
      </NamedFormComponent>
    </div>
  )
}

export function SunConstraintControls({
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
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
      <ErrorMessage name={getTarget('requiresDaylight')} errors={errors} />
      <Input
        title={'Requires Darkness'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('requiresDarkness')),
          type: 'checkbox',
          disabled,
        }}
      />
      <ErrorMessage name={getTarget('requiresDarkness')} errors={errors} />

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
      <ErrorMessage name={getTarget('maxHoursBeforeSunset')} errors={errors} />
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
      <ErrorMessage name={getTarget('minHoursAfterSunrise')} errors={errors} />
    </div>
  )
}

export function TimeConstraintControls({
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
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
      <ErrorMessage name={getTarget('earliestHour')} errors={errors} />
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
      <ErrorMessage name={getTarget('latestHour')} errors={errors} />
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
      <ErrorMessage name={getTarget('preferredHours')} errors={errors} />
    </div>
  )
}
export function DayConstraintControls({
  activityIndex,
  constraintIndex,
  disabled,
}: ControlsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
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
      <ErrorMessage name={getTarget('isWeekday')} errors={errors} />
      <Input
        title={'Weekend?'}
        className={'checkbox checkbox-sm rounded-sm'}
        inputProps={{
          ...register(getTarget('isWeekend')),
          type: 'checkbox',
          disabled,
        }}
      />
      <ErrorMessage name={getTarget('isWeekend')} errors={errors} />

      {/*<Input*/}
      {/*  title={'Dates'}*/}
      {/*  suffix={'List of date ranges to do this activity'}*/}
      {/*  className={'input input-sm'}*/}
      {/*  inputProps={{*/}
      {/*    ...register(getTarget('dateRanges')),*/}
      {/*    disabled,*/}
      {/*  }}*/}
      {/*/>*/}
      {/*<ErrorMessage name={getTarget('dateRanges')} errors={errors} />*/}
    </div>
  )
}

function WindSpeedInput({
  title,
  target,
  disabled,
}: {
  title: string
  target: RegisterParams[0]
  disabled: boolean
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TInputActivities>()
  return (
    <>
      <Input
        title={`${title} (knots)`}
        className={'input input-sm'}
        inputProps={{
          ...register(target, {
            setValueAs: (value) => knotsToMps(value),
          }),
          type: 'float',
          disabled,
        }}
      />
      <ErrorMessage name={target} errors={errors} />
    </>
  )
}
