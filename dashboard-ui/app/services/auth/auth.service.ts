import { axiosClassic } from '../../api/interceptor'
import { IAuthResponse } from '@/shared/interfaces/user.interface'
import {
  removeTokenFromStorage,
  saveToStorage,
} from '@/services/auth/auth.helper'

export const AuthService = {
  /**
   * POST /auth/login
   * Отправляет email и пароль на бэкенд.
   * При успешной авторизации сохраняет токены в cookies/localStorage.
   */
  async login(email: string, password: string) {
    const respone = await axiosClassic.post<IAuthResponse>('/auth/login', {
      email,
      password,
    })

    if (respone.data.accessToken) saveToStorage(respone.data)

    return respone.data
  },

  /**
   * POST /auth/register
   * Регистрирует нового пользователя и сохраняет токен для входа.
   */
  async register(email: string, password: string) {
    const respone = await axiosClassic.post<IAuthResponse>('/auth/register', {
      email,
      password,
    })

    if (respone.data.accessToken) saveToStorage(respone.data)

    return respone.data
  },

  /**
   * Удаляет сохранённые токены и пользователя из хранилища.
   */
  logout() {
    removeTokenFromStorage()
    localStorage.removeItem('user')
  },
}
