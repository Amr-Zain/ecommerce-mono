
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.png'
declare module '*.gif'
declare module '*.webp'
declare module '*.svg'
interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_BASE_URL: string
  readonly VITE_BASE_GENERAL_URL: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_BASE_URL_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}