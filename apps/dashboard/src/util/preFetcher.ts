import axiosInstance from "@/services/instance";
import { QueryClient, QueryKey } from "@tanstack/react-query";
import axios from "axios";
import { redirect } from "@tanstack/react-router";
import i18n from '@/i18n';
import { useAuthStore } from "@/stores/authStore";



export function prefetchOptions(
    { queryKey, endpoint, params = {}, general = false, customBaseUrl }: {
        queryKey: QueryKey,
        endpoint: string,
        params?: Record<string, any>,
        general?: boolean,
        customBaseUrl?: string,

    }
) {
    const paginationParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...params,
    }
    const baseURL = customBaseUrl
      ? customBaseUrl
      : general
        ? import.meta.env.VITE_BASE_GENERAL_URL
        : import.meta.env.VITE_BASE_URL
        
    const isRTL = (i18n.language || 'ar').startsWith('ar')
    const fullQueryKey = [...queryKey, isRTL];
    return {
        queryKey: fullQueryKey,
        staleTime: 6000_000,
        queryFn: async () => {
            try {
                const res = await axiosInstance.get(`${baseURL}/${endpoint}`, {
                    params: { ...params, ...paginationParams }
                });
                if (res.data?.error) {
                    throw new Error(res.data.message);
                }
                return res.data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    useAuthStore.getState().clearUser();
                    throw redirect({ to: "/auth/login" });
                }
                throw error;
            }
        },
    };
}