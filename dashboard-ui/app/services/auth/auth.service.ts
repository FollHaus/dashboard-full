import { axiosClassic } from '../../api/interceptor'
import { IAuthResponse } from '@/shared/interfaces/user.interface'
import {
  removeTokenFromStorage,
  saveToStorage,
} from '@/services/auth/auth.helper'

export const AuthService = {
  async login(email: string, password: string) {
    const respone = await axiosClassic.post<IAuthResponse>('/auth/login', {
      email,
      password,
    })

    if (respone.data.accessToken) saveToStorage(respone.data)

    return respone.data
  },

  async register(email: string, password: string) {
    const respone = await axiosClassic.post<IAuthResponse>('/auth/register', {
      email,
      password,
    })

    if (respone.data.accessToken) saveToStorage(respone.data)

    return respone.data
  },

  logout() {
    removeTokenFromStorage()
    localStorage.removeItem('user')
  },
}
