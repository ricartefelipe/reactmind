import { createMindHandlers } from '@ricartefelipe/mind-wallet-shared/msw'
import type { RequestHandler } from 'msw'

export const handlers = createMindHandlers({
  apiBasePath: '/api/v1',
  systemSlug: 'reactmind',
}) as unknown as RequestHandler[]
