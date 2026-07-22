export function validatePixAmount(
  amountCents: number,
  balanceCents: number,
): string | null {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return 'INVALID_AMOUNT'
  }
  if (amountCents > balanceCents) return 'INSUFFICIENT_FUNDS'
  return null
}
