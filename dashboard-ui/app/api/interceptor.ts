import axios from 'axios'
import Cookies from 'js-cookie'

/**
 * Функция возвращает стандартные заголовки для запросов.
 * Устанавливает тип содержимого как JSON.
 */
export const getContentType = () => ({
  'Content-Type': 'application/json',
})

/**
 * Базовый URL API.
 * Значение берётся из переменной окружения `process.env.APP_URL`.
 * В конечной точке будет добавляться `/api`, например:
 * http://localhost:3000/api
 */
export const APP_URL = `${process.env.APP_URL}/api`

/**
 * Экземпляр Axios без авторизации.
 * Используется, когда не требуется токен.
 */
export const axiosClassic = axios.create({
  baseURL: APP_URL,
  headers: getContentType(), // Установка заголовков по умолчанию
})

/**
 * Основной экземпляр Axios.
 * Поддерживает автоматическое добавление токена в заголовки запроса.
 */
const instance = axios.create({
  baseURL: APP_URL,
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

// Экспортируем основной инстанс Axios
export default instance
