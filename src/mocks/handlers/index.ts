import { createMindHandlers } from '@ricartefelipe/mind-wallet-shared/msw'
import type { RequestHandler } from 'msw'

export function createAppHandlers() {
  return createMindHandlers({
    apiBasePath: '/api/v1',
    systemSlug: 'reactmind',
  }) as unknown as RequestHandler[]
}

export const handlers = createAppHandlers()
