type Props = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  id?: string
}

export function Input({ label, type = 'text', value, onChange, id }: Props) {
  const inputId = id ?? label

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
