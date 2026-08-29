export function LoadingBlock({ label = 'Carregando…' }: Readonly<{ label?: string }>) {
  return <output className="loading">{label}</output>
}
