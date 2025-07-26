export type InputWithDescriptionProps<T> = {
  description: string
  placeholder?: T
  setValue?: (value: string) => void
  title: string
  value?: T
}

export function InputWithDescription<T>({
  description,
  placeholder,
  setValue,
  title,
  value,
}: InputWithDescriptionProps<T>) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{title}</legend>
      <input
        className="input"
        onChange={(e) => (setValue ? setValue(e.target.value) : null)}
        placeholder={String(placeholder)}
        type="text"
        value={String(value)}
      />
      <label className="label">{description}</label>
    </fieldset>
  )
}
