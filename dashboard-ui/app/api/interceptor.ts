import axios from 'axios'
import Cookies from 'js-cookie'
// Удаляет access token из cookies при разлогине или истечении сессии
import { removeTokenFromStorage } from '@/services/auth/auth.helper'

/**
 * Функция возвращает стандартные заголовки для запросов.
 * Устанавливает тип содержимого как JSON.
 */
export const getContentType = () => ({
  'Content-Type': 'application/json',
})

/**
 * Базовый URL API.
 * Взято из `NEXT_PUBLIC_API_URL` чтобы фронтенд
 * знал адрес бекенда при сборке.
 * Пример: http://localhost:4000/api
 */
export const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`

/**
 * Экземпляр Axios без авторизации.
 * Используется, когда не требуется токен.
 */
export const axiosClassic = axios.create({
  baseURL: API_URL,
  headers: getContentType(), // Установка заголовков по умолчанию
})

/**
 * Основной экземпляр Axios.
 * Поддерживает автоматическое добавление токена в заголовки запроса.
 */
const instance = axios.create({
  baseURL: API_URL,
  headers: getContentType(),
})

/**
 * Axios interceptor для добавления токена в заголовок `Authorization`.
 * Перехватывает каждый запрос перед его отправкой.
 */
instance.interceptors.request.use(config => {
  // Получаем access token из cookies
  const accessToken = Cookies.get('accessToken')

  // Если есть токен — добавляем его в заголовок Authorization
  if (config.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config // Возвращаем обновлённый конфиг запроса
})

/**
 * Глобальная обработка ответов.
 * Выделяем сообщение об ошибке и пробрасываем его выше, чтобы UI мог
 * показать понятный текст пользователю.
 */
instance.interceptors.response.use(
  response => response,
  error => {
    // Если бекенд вернул 401 — токен недействителен, удаляем его
    if (error.response?.status === 401) {
      removeTokenFromStorage()
    }

    // Формируем понятное сообщение об ошибке для UI
    const message = error?.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
)

// Экспортируем основной инстанс Axios
export default instance
