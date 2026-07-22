export type User = {
  id: string
  name: string
  email: string
}

export type LoginResponse = {
  accessToken: string
  user: User
}
