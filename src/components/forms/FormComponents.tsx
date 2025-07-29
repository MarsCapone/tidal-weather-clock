export type LabelledInputProps = {
  optional?: boolean
  type?: HTMLInputElement['type']
  label: string
  defaultValue?: HTMLInputElement['defaultValue']
  inputClasses?: string | string[]
  fieldsetClasses?: string | string[]
  readonly?: boolean
}

export function LabelledInput({
  optional,
  type,
  label,
  defaultValue,
  inputClasses,
  fieldsetClasses,
  readonly,
}: LabelledInputProps) {
  const classNamesToString = (v: string | string[] | undefined) => {
    if (v === undefined) {
      return ''
    }
    if (typeof v === 'string') {
      return v
    }
    return v.join(' ')
  }

  return (
    <fieldset className={`fieldset ${classNamesToString(fieldsetClasses)}`}>
      <legend className="fieldset-legend">{label}</legend>
      <input
        type={type || 'text'}
        className={`input ${classNamesToString(inputClasses)}`}
        defaultValue={defaultValue}
        readOnly={readonly}
      />
      {optional && !readonly && <p className="label">Optional</p>}
    </fieldset>
  )
}
