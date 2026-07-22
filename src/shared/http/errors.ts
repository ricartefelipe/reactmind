export class ApiError extends Error {
  public status: number
  public code: string
  public correlationId: string

  constructor(
    status: number,
    code: string,
    message: string,
    correlationId: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.correlationId = correlationId
  }
}
