import { createArchiveClient } from '@ricartefelipe/mind-wallet-shared/archive'

const baseUrl = import.meta.env.VITE_MALHA_URL ?? '/malha'
const token = import.meta.env.VITE_MIND_TOKEN ?? 'mind-demo-atlas-norte'

export const archiveClient = createArchiveClient({ baseUrl, token })

export const DEFAULT_WORKSPACE_SLUG = 'atlas-norte'

export const ARCHIVE_PROMPTS = [
  'Quem pode acessar dados de produção da carteira?',
  'Analistas ledger.reader podem acessar dados de produção da carteira?',
  'TotalRecall autentica o usuário na Carteira Mind?',
  'Quando a norma de evidências recusa uma síntese?',
  'Qual o salário do diretor de marketing da cooperativa em 2019?',
] as const
