import { HTMLProps } from 'react'

export type NamedFormComponentProps = {
  title: string
  suffix?: string | React.ReactNode
}

export function NamedFormComponent({
  title,
  suffix,
  children,
}: NamedFormComponentProps & { children?: React.ReactNode }) {
  return (
    <fieldset className="fieldset">
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
  inputProps,
}: NamedFormComponentProps & {
  className: string
  inputProps: HTMLProps<HTMLInputElement>
}): React.ReactElement {
  return (
    <NamedFormComponent title={title} suffix={suffix}>
      <input className={className} {...inputProps} />
    </NamedFormComponent>
  )
}
