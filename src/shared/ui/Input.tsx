type Props = Readonly<{
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  id?: string
  error?: string
  disabled?: boolean
}>

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  id,
  error,
  disabled,
}: Props) {
  const inputId = id ?? label

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}
