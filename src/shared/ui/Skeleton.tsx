type Props = {
  lines?: number
}

export function Skeleton({ lines = 3 }: Props) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="skeleton__line" />
      ))}
    </div>
  )
}
