const RAW_BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const ADMIN_API_BASE_URL = RAW_BASE_URL
export const API_BASE_URL = RAW_BASE_URL.replace(/\/admin$/, '')
