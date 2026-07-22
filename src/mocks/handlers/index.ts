import { authHandlers } from './auth.handlers'
import { beneficiariesHandlers } from './beneficiaries.handlers'
import { transfersHandlers } from './transfers.handlers'
import { walletHandlers } from './wallet.handlers'

export const handlers = [
  ...authHandlers,
  ...walletHandlers,
  ...beneficiariesHandlers,
  ...transfersHandlers,
]
