"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { Image } from "@/types/api/general";

export interface UserLocation {
  lat: number
  lng: number
}

export interface UserSettings {
  language: 'ar' | 'en'
  allow_notifications: boolean
  market?: string
}

export type PermissionAction = 'index' | 'show' | 'store' | 'update' | 'delete' | 'destroy' 

export type UserPermissions = Record<string, PermissionAction[]>

export interface UserCountry {
  id: number
  name: string
  code: string
  flag: {
    id: number
    hash: string
    mime_type: string
    url: string
  } | null
  phone_length: number
  phone_starting_number: number
}

export interface Tier {
  id: number
  name: string
  icon: Image | null
  multiplier: number
  min_lifetime_points: number
  color: string
}

export interface UserAuth {
  id: number
  role?: {
    id: number
    name: string
  }
  name: string
  email: string
  phone_code: string
  phone: string
  gender?: 'male' | 'female' | string | null
  birth_date?: string | null
  country: UserCountry | null
  image: Image | null
  user_type: 'super_admin' | 'admin' | 'user' | string
  is_active: boolean
  is_verified: boolean | string | null
  is_banned: boolean
  is_suspended: boolean
  settings: UserSettings
  location: UserLocation
  points_earned?: number
  points_balance?: number
  current_tier?: Tier | null
  next_tier?: Tier | null
  points_to_next_tier?: number
  wishlist?: any[]
  recently_viewed?: any[]
  permissions: UserPermissions
  token: string
  verification_token: string | null
}

interface AuthStore {
  user: UserAuth | null;
  token: string | null;
  setUser: (user: UserAuth) => void;
  updateUser: (user: any) => void;
  clearUser: () => void;
}



export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => {
        set({ user, token: user.token ?? get().token });
        console.log(user.permissions);

      },
      updateUser: (values) => {
        set({ user: { ...get()?.user, ...values } });

      },
      clearUser: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
