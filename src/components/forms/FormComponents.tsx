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
  label: string
  fieldsetClasses?: string | string[]
  optional?: boolean
}

export function Fieldset({
  label,
  fieldsetClasses,
  optional,
  children,
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
  type?: HTMLInputElement['type']
  defaultValue?: HTMLInputElement['defaultValue']
  inputClasses?: string | string[]
  readonly?: boolean
}

export function Input({
  optional,
  type,
  label,
  defaultValue,
  inputClasses,
  fieldsetClasses,
  readonly,
}: InputProps) {
  return (
    <Fieldset
      label={label}
      fieldsetClasses={fieldsetClasses}
      optional={optional}
      readonly={readonly}
    >
      <input
        type={type || 'text'}
        className={`input ${classNamesToString(inputClasses)}`}
        defaultValue={defaultValue}
        readOnly={readonly}
      />
    </Fieldset>
  )
}

type PrefixSuffixInputProps = InputProps & {
  prefix?: string | React.ReactNode
  suffix?: string | React.ReactNode
}
export function PrefixSuffixInput({
  optional,
  type,
  label,
  defaultValue,
  inputClasses,
  fieldsetClasses,
  readonly,
  prefix,
  suffix,
}: PrefixSuffixInputProps) {
  return (
    <Fieldset
      label={label}
      fieldsetClasses={fieldsetClasses}
      optional={optional}
      readonly={readonly}
    >
      <label className={`input ${classNamesToString(inputClasses)}`}>
        {prefix}
        <input
          type={type || 'text'}
          className={`grow`}
          defaultValue={defaultValue}
          readOnly={readonly}
        />
        {suffix}
      </label>
    </Fieldset>
  )
}
