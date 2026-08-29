import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  entityTypeLabel,
  formatScore,
  groundingLabel,
  hopLabel,
  planKindLabel,
  type DocumentRow,
  type Evidence,
  type GraphSnapshot,
  type QueryResult,
} from '@ricartefelipe/mind-wallet-shared/archive/types'
import { Button } from '@/shared/ui/Button'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { ARCHIVE_PROMPTS, archiveClient, DEFAULT_WORKSPACE_SLUG } from './api'

type TabId = 'consulta' | 'arquivo' | 'grafo'

export function ArchivePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabId>('consulta')
  const [workspaceId, setWorkspaceId] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [question, setQuestion] = useState<string>(ARCHIVE_PROMPTS[0])
  const [hops, setHops] = useState(1)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [selected, setSelected] = useState<Evidence | null>(null)
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [graph, setGraph] = useState<GraphSnapshot | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [bootError, setBootError] = useState<string | null>(null)

  useEffect(() => {
    void bootstrap()
  }, [])

  useEffect(() => {
    if (!workspaceId) {
      return
    }
    void refreshArchive(workspaceId)
  }, [workspaceId, tab])

  async function bootstrap() {
    try {
      const list = await archiveClient.listWorkspaces()
      const preferred =
        list.find((item) => item.slug === DEFAULT_WORKSPACE_SLUG) ?? list[0]
      if (!preferred) {
        setBootError(t('archive.errors.noWorkspace'))
        return
      }
      setWorkspaceId(preferred.slug)
      setWorkspaceName(preferred.name)
    } catch (error) {
      setBootError(
        error instanceof Error ? error.message : t('archive.errors.unavailable'),
      )
    }
  }

  async function refreshArchive(id: string) {
    try {
      const docs = await archiveClient.listDocuments(id)
      setDocuments(docs)
      if (tab === 'grafo') {
        setGraph(await archiveClient.fetchGraph(id))
      }
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : t('archive.errors.loadFailed'),
      )
    }
  }

  async function runQuery(event: FormEvent) {
    event.preventDefault()
    if (!workspaceId || !question.trim()) {
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      const next = await archiveClient.queryWorkspace(
        workspaceId,
        question.trim(),
        hops,
      )
      setResult(next)
      setSelected(next.evidence[0] ?? null)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t('archive.errors.queryFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function mark(label: 'useful' | 'wrong') {
    if (!workspaceId || !selected || !result) {
      return
    }
    await archiveClient.sendFeedback(
      workspaceId,
      selected.chunk_id,
      label,
      result.query_id,
    )
    setNotice(
      label === 'useful' ? t('archive.feedback.useful') : t('archive.feedback.wrong'),
    )
  }

  async function onUpload(file: File | undefined) {
    if (!file || !workspaceId) {
      return
    }
    setBusy(true)
    try {
      await archiveClient.ingestFile(workspaceId, file)
      await refreshArchive(workspaceId)
      setNotice(t('archive.ingested', { name: file.name }))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t('archive.errors.ingestFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function onSeed() {
    if (!workspaceId) {
      return
    }
    setBusy(true)
    try {
      await archiveClient.seedWorkspace(workspaceId)
      await refreshArchive(workspaceId)
      setNotice(t('archive.seeded'))
    } finally {
      setBusy(false)
    }
  }

  if (bootError) {
    return (
      <section className="archive-page">
        <header className="archive-page__head">
          <p className="wallet-page__eyebrow">{t('archive.eyebrow')}</p>
          <h1>{t('archive.title')}</h1>
          <p className="archive-page__lead">{t('archive.lead')}</p>
        </header>
        <ErrorBanner message={bootError} />
        <p className="archive-page__hint">{t('archive.hint')}</p>
      </section>
    )
  }

  return (
    <section className="archive-page">
      <header className="archive-page__head">
        <p className="wallet-page__eyebrow">{t('archive.eyebrow')}</p>
        <h1>{t('archive.title')}</h1>
        <p className="archive-page__lead">{t('archive.lead')}</p>
        <div className="archive-page__meta">
          <span>{workspaceName}</span>
          <span>{t('archive.documents', { count: documents.length })}</span>
        </div>
      </header>

      <nav className="archive-tabs" aria-label={t('archive.sections')}>
        {(['consulta', 'arquivo', 'grafo'] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'archive-tabs__btn archive-tabs__btn--active' : 'archive-tabs__btn'}
            onClick={() => setTab(id)}
          >
            {t(`archive.tabs.${id}`)}
          </button>
        ))}
      </nav>

      {notice ? <p className="archive-notice">{notice}</p> : null}

      {tab === 'consulta' ? (
        <ConsultaPanel
          question={question}
          hops={hops}
          busy={busy}
          result={result}
          selected={selected}
          onQuestion={setQuestion}
          onHops={setHops}
          onSubmit={runQuery}
          onSelect={setSelected}
          onMark={mark}
        />
      ) : null}
      {tab === 'arquivo' ? (
        <ArquivoPanel documents={documents} busy={busy} onUpload={onUpload} onSeed={onSeed} />
      ) : null}
      {tab === 'grafo' ? <GrafoPanel snapshot={graph} /> : null}
    </section>
  )
}

type ConsultaPanelProps = Readonly<{
  question: string
  hops: number
  busy: boolean
  result: QueryResult | null
  selected: Evidence | null
  onQuestion: (value: string) => void
  onHops: (value: number) => void
  onSubmit: (event: FormEvent) => void
  onSelect: (item: Evidence) => void
  onMark: (label: 'useful' | 'wrong') => void
}>

function ConsultaPanel({
  question,
  hops,
  busy,
  result,
  selected,
  onQuestion,
  onHops,
  onSubmit,
  onSelect,
  onMark,
}: ConsultaPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="archive-split">
      <div className="archive-panel">
        <form className="archive-form" onSubmit={onSubmit}>
          <label htmlFor="archive-question">{t('archive.questionLabel')}</label>
          <textarea
            id="archive-question"
            value={question}
            onChange={(event) => onQuestion(event.target.value)}
            rows={3}
          />
          <div className="archive-form__tools">
            <label>
              <span>{t('archive.hops')}</span>
              <input
                type="number"
                min={0}
                max={3}
                value={hops}
                onChange={(event) => onHops(Number(event.target.value))}
              />
            </label>
            <Button type="submit" disabled={busy}>
              {busy ? t('common.loading') : t('archive.submit')}
            </Button>
          </div>
          <div className="archive-prompts">
            {ARCHIVE_PROMPTS.map((item) => (
              <button key={item} type="button" className="archive-prompts__chip" onClick={() => onQuestion(item)}>
                {item}
              </button>
            ))}
          </div>
        </form>
        {result ? <SynthesisCard result={result} /> : <SynthesisIdle />}
      </div>

      <aside className="archive-evidence">
        <h2>{t('archive.evidenceTitle')}</h2>
        {result?.evidence.map((item, index) => (
          <button
            key={item.chunk_id}
            type="button"
            className={
              selected?.chunk_id === item.chunk_id
                ? 'archive-evidence__item archive-evidence__item--active'
                : 'archive-evidence__item'
            }
            onClick={() => onSelect(item)}
          >
            <span className="archive-evidence__index">{String(index + 1).padStart(2, '0')}</span>
            <span className="archive-evidence__title">{item.document_title}</span>
            <span className="archive-evidence__score">
              {t('archive.evidenceMeta', {
                score: formatScore(item.score),
                hop: hopLabel(item.hop),
                cited: result.answer.cited_chunk_ids.includes(item.chunk_id)
                  ? t('archive.cited')
                  : '',
              })}
            </span>
          </button>
        ))}
        {selected ? (
          <div className="archive-excerpt">
            <p className="archive-excerpt__source">
              {selected.source_path} · {t('archive.ordinal', { n: selected.ordinal })}
            </p>
            <blockquote>{selected.excerpt}</blockquote>
            <div className="archive-excerpt__marks">
              <Button type="button" variant="secondary" onClick={() => onMark('useful')}>
                {t('archive.markUseful')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => onMark('wrong')}>
                {t('archive.markWrong')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="archive-empty">{t('archive.noEvidenceSelected')}</p>
        )}
      </aside>
    </div>
  )
}

function SynthesisIdle() {
  const { t } = useTranslation()
  return (
    <article className="archive-synthesis archive-synthesis--idle">
      <h2>{t('archive.idleTitle')}</h2>
      <p>{t('archive.idleBody')}</p>
    </article>
  )
}

function SynthesisCard({ result }: Readonly<{ result: QueryResult }>) {
  const { t } = useTranslation()
  const tone = synthesisTone(result)
  return (
    <article className={`archive-synthesis archive-synthesis--${tone}`}>
      <div className="archive-synthesis__head">
        <h2>{t(`archive.synthesis.${tone === 'ok' ? 'ok' : tone}`)}</h2>
        <span className={`archive-seal archive-seal--${result.verification.status}`}>
          {groundingLabel(result.verification.status)}
        </span>
      </div>
      {result.plan.length > 0 ? (
        <ol className="archive-plan">
          {result.plan.map((step) => (
            <li key={step.id}>
              <span>{planKindLabel(step.kind)}</span>
              {step.objective}
            </li>
          ))}
        </ol>
      ) : null}
      <p className="archive-synthesis__body">{result.answer.text}</p>
      {result.answer.refusal_reason ? (
        <p className="archive-synthesis__reason">{result.answer.refusal_reason}</p>
      ) : null}
      {result.verification.contradictions.length > 0 ? (
        <ul className="archive-conflicts">
          {result.verification.contradictions.map((item) => (
            <li key={`${item.left_chunk_id}-${item.right_chunk_id}`}>
              <strong>{item.subject}</strong>
              <span>{item.reason}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

type SynthesisTone = 'refused' | 'conflict' | 'ok'

function synthesisTone(result: QueryResult): SynthesisTone {
  if (result.answer.refused) {
    return 'refused'
  }
  if (result.verification.status === 'conflict') {
    return 'conflict'
  }
  return 'ok'
}

type ArquivoPanelProps = Readonly<{
  documents: DocumentRow[]
  busy: boolean
  onUpload: (file: File | undefined) => void
  onSeed: () => void
}>

function ArquivoPanel({ documents, busy, onUpload, onSeed }: ArquivoPanelProps) {
  const { t } = useTranslation()
  return (
    <section className="archive-files">
      <div className="archive-files__tools">
        <label className="archive-files__upload">
          <span>{t('archive.uploadLabel')}</span>
          <input
            type="file"
            accept=".pdf,.md,.markdown,.txt"
            disabled={busy}
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
        </label>
        <Button type="button" variant="secondary" disabled={busy} onClick={onSeed}>
          {t('archive.seedCorpus')}
        </Button>
      </div>
      <div className="archive-table-wrap">
        <table className="archive-table">
          <thead>
            <tr>
              <th>{t('archive.table.title')}</th>
              <th>{t('archive.table.source')}</th>
              <th>{t('archive.table.chunks')}</th>
              <th>{t('archive.table.ingested')}</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.title}</td>
                <td className="archive-table__mono">{doc.source_path}</td>
                <td>{doc.chunks}</td>
                <td className="archive-table__mono">{doc.ingested_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function GrafoPanel({ snapshot }: Readonly<{ snapshot: GraphSnapshot | null }>) {
  const { t } = useTranslation()
  const layout = useMemo(() => {
    const entities = snapshot?.entities.slice(0, 36) ?? []
    const width = 720
    const height = 420
    const cx = width / 2
    const cy = height / 2
    const radius = 170
    const nodes = entities.map((entity, index) => {
      const angle = (index / Math.max(entities.length, 1)) * Math.PI * 2 - Math.PI / 2
      return {
        ...entity,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }
    })
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const edges = (snapshot?.relations ?? [])
      .map((rel) => {
        const src = byId.get(rel.src)
        const dst = byId.get(rel.dst)
        if (!src || !dst) {
          return null
        }
        return { ...rel, src, dst }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
    return { nodes, edges, width, height }
  }, [snapshot])

  if (!snapshot) {
    return <p className="archive-empty">{t('archive.graphEmpty')}</p>
  }

  return (
    <section className="archive-graph">
      <svg
        className="archive-graph__svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={t('archive.graphAria')}
      >
        {layout.edges.map((edge) => (
          <line
            key={edge.id}
            x1={edge.src.x}
            y1={edge.src.y}
            x2={edge.dst.x}
            y2={edge.dst.y}
          />
        ))}
        {layout.nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle r={6} />
            <text y={-10}>{node.name.slice(0, 24)}</text>
          </g>
        ))}
      </svg>
      <ul className="archive-graph__legend">
        {snapshot.entities.slice(0, 10).map((entity) => (
          <li key={entity.id}>
            <strong>{entity.name}</strong>
            <span>{entityTypeLabel(entity.type)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
