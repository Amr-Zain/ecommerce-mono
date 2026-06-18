
import i18n from '@/i18n';
import { useAuthStore } from '@/stores/authStore';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import {
  getAccessTokenUserType,
  isDashboardUser,
  mapDashboardAuthResponse,
  unwrapApiData,
} from '@/lib/dashboardAuth';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

interface ErrorResponse {
  status: number;
  message: string;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use((config: any) => {
  // Only send cookies for auth endpoints
  config.withCredentials = !!config.url?.includes('/auth/');

  const user_token = useAuthStore.getState().token;

  if(user_token){
    config.headers["Authorization"] = `Bearer ${user_token}`;
  }

  config.headers = {
    ...config.headers,
    'Accept-Language': `${i18n.language || 'ar'}`,
  };

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): AxiosResponse<ApiResponse> => response,
  async (error: AxiosError<ErrorResponse>) => {
    console.log("🚀 ~ error:", error)
    const { status } = error.response || {};
    const originalRequest: any = error.config;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios({
          method: 'post',
          url: `${import.meta.env.VITE_BASE_URL_API}/auth/refresh`,
          withCredentials: true,
          headers: {
            'x-platform': 'browser',
            'x-user-type': 'admin',
          }
        })
          .then(({ data }) => {
            const response = unwrapApiData<any>(data);
            const newAccessToken = response?.access_token || response?.accessToken;
            if (getAccessTokenUserType(newAccessToken) !== 'admin') {
              throw new Error('Refresh token does not belong to an admin user');
            }
            
            const user = mapDashboardAuthResponse(response);
            if (!isDashboardUser(user)) {
              throw new Error('Refresh token does not belong to a dashboard user');
            }
            useAuthStore.getState().setUser(user);

            // Update Auth header for retry
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            processQueue(null, newAccessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            // Clear user session and redirect on refresh failure
            useAuthStore.getState().clearUser();
            // window.location.replace('/auth/login');
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    switch (status) {
      case 400:
        console.error('Bad Request:', status);
        break;
      case 404:
        console.error('Not Found:', status);
        break;
      case 500:
        console.error('Server Error:', status);
        break;
      default:
        console.error('Unhandled Error:', status);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
