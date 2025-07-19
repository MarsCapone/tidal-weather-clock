export function InputWithDescription<T>({
  title,
  description,
  placeholder,
  value,
  setValue,
}: {
  title: string
  description: string
  placeholder?: T
  value?: T
  setValue?: (value: string) => void
}) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{title}</legend>
      <input
        className="input"
        type="text"
        placeholder={String(placeholder)}
        value={String(value)}
        onChange={(e) => (setValue ? setValue(e.target.value) : null)}
      />
      <label className="label">{description}</label>
    </fieldset>
  )
}
