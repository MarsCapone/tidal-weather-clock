import React from 'react'

const classNamesToString = (v: string | string[] | undefined) => {
  if (v === undefined) {
    return ''
  }
  if (typeof v === 'string') {
    return v
  }
  return v.join(' ')
}

type FieldsetProps = {
  fieldsetClasses?: string | string[]
  label: string
  optional?: boolean
}

export function Fieldset({
  children,
  fieldsetClasses,
  label,
  optional,
}: FieldsetProps & { children: React.ReactNode }) {
  return (
    <fieldset className={`fieldset ${classNamesToString(fieldsetClasses)}`}>
      <legend className="fieldset-legend">{label}</legend>
      {children}
      {optional && <p className="label">Optional</p>}
    </fieldset>
  )
}

type InputProps = FieldsetProps & {
  defaultValue?: HTMLInputElement['defaultValue']
  inputClasses?: string | string[]
  readonly?: boolean
  type?: HTMLInputElement['type']
}

export function Input({
  defaultValue,
  fieldsetClasses,
  inputClasses,
  label,
  optional,
  readonly,
  type,
}: InputProps) {
  return (
    <Fieldset
      fieldsetClasses={fieldsetClasses}
      label={label}
      optional={optional}
    >
      <input
        className={`input ${classNamesToString(inputClasses)}`}
        defaultValue={defaultValue}
        readOnly={readonly}
        type={type || 'text'}
      />
    </Fieldset>
  )
}

type PrefixSuffixInputProps = InputProps & {
  prefix?: string | React.ReactNode
  suffix?: string | React.ReactNode
}
export function PrefixSuffixInput({
  defaultValue,
  fieldsetClasses,
  inputClasses,
  label,
  optional,
  prefix,
  readonly,
  suffix,
  type,
}: PrefixSuffixInputProps) {
  return (
    <Fieldset
      fieldsetClasses={fieldsetClasses}
      label={label}
      optional={optional}
    >
      <label className={`input ${classNamesToString(inputClasses)}`}>
        {prefix}
        <input
          className={'grow'}
          defaultValue={defaultValue}
          readOnly={readonly}
          type={type || 'text'}
        />
        {suffix}
      </label>
    </Fieldset>
  )
}
