import { HTMLProps } from 'react'
import { ClassNames } from 'react-day-picker'

export type NamedFormComponentProps = {
  title: string
  className?: string
  suffix?: string | React.ReactNode
}

export function NamedFormComponent({
  title,
  className,
  suffix,
  children,
}: NamedFormComponentProps & { children?: React.ReactNode }) {
  return (
    <fieldset className={`fieldset ${className || ''}`}>
      <legend className="fieldset-legend">{title}</legend>
      {children}
      {suffix && <p className="label">{suffix}</p>}
    </fieldset>
  )
}

export function Input({
  title,
  suffix,
  className,
  outerClassName,
  inputProps,
}: NamedFormComponentProps & {
  outerClassName?: string
  inputProps: HTMLProps<HTMLInputElement>
}): React.ReactElement {
  return (
    <NamedFormComponent
      title={title}
      suffix={suffix}
      className={outerClassName}
    >
      <input className={className} {...inputProps} />
    </NamedFormComponent>
  )
}
