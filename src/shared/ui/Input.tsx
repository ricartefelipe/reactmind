export function Input(props: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      {props.label}
      <input
        type={props.type}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </label>
  )
}
