export function validatePixAmount(
  amountCents: number,
  balanceCents: number,
  dailyLimitCents?: number,
  dailySpentCents?: number,
): string | null {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return 'INVALID_AMOUNT'
  }
  if (amountCents > balanceCents) return 'INSUFFICIENT_FUNDS'
  if (
    dailyLimitCents !== undefined &&
    dailySpentCents !== undefined &&
    dailySpentCents + amountCents > dailyLimitCents
  ) {
    return 'DAILY_LIMIT_EXCEEDED'
  }
  return null
}
