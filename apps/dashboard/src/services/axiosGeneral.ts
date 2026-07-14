import axios from 'axios'
import Cookies from 'js-cookie'

import {
  getDashboardAccessToken,
  installDashboardRefreshInterceptor,
} from '@/lib/dashboard-session'
import { API_BASE_URL } from '@/lib/env'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

axiosInstance.interceptors.request.use(
  (config) => {
    config.withCredentials = Boolean(config.url?.includes('/auth/'))

    const token = getDashboardAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`

    config.headers['Accept-Language'] = Cookies.get('NEXT_LOCALE') || 'en'
    return config
  },
  (error) => Promise.reject(error),
)

installDashboardRefreshInterceptor(axiosInstance)

export default axiosInstance
