export interface IUser {
  id: number
  name: string
  email: string
}

export interface IAuthResponse {
  user: IUser
  accessToken: string
}
