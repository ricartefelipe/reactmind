export function LoadingBlock({ label = 'Carregando…' }: { label?: string }) {
  return (
    <p className="loading" role="status">
      {label}
    </p>
  )
}
