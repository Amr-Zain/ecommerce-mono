import axios from 'axios'
import type { AxiosInstance } from 'axios';

import i18n from '@/i18n'
import {
  getDashboardAccessToken,
  installDashboardRefreshInterceptor,
} from '@/lib/dashboard-session'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

axiosInstance.interceptors.request.use((config) => {
  config.withCredentials = Boolean(config.url?.includes('/auth/'))

  const token = getDashboardAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`

  config.headers['Accept-Language'] = i18n.language || 'ar'
  return config
})

installDashboardRefreshInterceptor(axiosInstance)

export default axiosInstance
