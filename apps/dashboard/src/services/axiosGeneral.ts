import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta?.env?.VITE_BASE_GENERAL_URL!,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Only send cookies for auth endpoints
    config.withCredentials = !!config.url?.includes('/auth/');

    const locale = Cookies.get("NEXT_LOCALE") || "en";
    const userToken = useAuthStore.getState().token;

    if (!config.params) {
      config.params = {};
    }

    if(userToken){
      config.headers["Authorization"] = `Bearer ${userToken}`;
    }
    config.headers["Accept-Language"] = locale;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

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
          url: `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
          withCredentials: true,
          headers: {
            'x-platform': 'browser'
          }
        })
          .then(({ data }) => {
            const newAccessToken = data?.data?.access_token || data.access_token || data.accessToken;
            
            // Save new token in store
            const user = useAuthStore.getState().user;
            if (user) {
              useAuthStore.setState({
                user: { ...user, token: newAccessToken },
                token: newAccessToken,
              });
            } else {
              useAuthStore.setState({ token: newAccessToken });
            }

            // Update Auth header for retry
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            processQueue(null, newAccessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            // Clear user session and redirect on refresh failure
            useAuthStore.getState().clearUser();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
