import axios from "axios";
import { redirect } from "@tanstack/react-router";
import type { QueryKey } from "@tanstack/react-query";

import axiosInstance from "@/services/instance";
import { clearDashboardSession } from '@/lib/dashboard-session'
import { getSafeDashboardRedirect } from '@/lib/auth-redirect'
import { ADMIN_API_BASE_URL, API_BASE_URL } from "@/lib/env";



export function prefetchOptions(
    { queryKey, endpoint, params = {}, general = false }: {
        queryKey: QueryKey,
        endpoint: string,
        params?: Record<string, any>,
        general?: boolean,
    }
) {
    const paginationParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...params,
    }
    const baseURL = general ? API_BASE_URL : ADMIN_API_BASE_URL

    return {
        queryKey,
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
                    clearDashboardSession({ redirect: false });
                    const returnTo = typeof window === 'undefined'
                        ? '/'
                        : `${window.location.pathname}${window.location.search}${window.location.hash}`;
                    throw redirect({
                        to: "/auth/login",
                        search: { redirect: getSafeDashboardRedirect(returnTo) },
                    });
                }
                throw error;
            }
        },
    };
}
