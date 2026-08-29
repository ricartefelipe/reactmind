type Props = Readonly<{
  title?: string
  description?: string
  message?: string
}>

export function EmptyState({ title, description, message }: Props) {
  return (
    <div className="empty">
      <strong>{title || message}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  )
}
