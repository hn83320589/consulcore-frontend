import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Toast 回調（由 main.ts 在 Pinia 初始化後註冊）────
let toastFn: ((msg: string, type: 'error' | 'warning') => void) | null = null

export function registerToast(fn: (msg: string, type: 'error' | 'warning') => void) {
  toastFn = fn
}

// ── 認證狀態來源（由 authStore 註冊）─────────────
// 必須讀「當下」的 token / activeRole：persist 寫入 localStorage 是非同步的
// （$subscribe flush:'pre'），切換角色後若從 localStorage 讀會拿到舊值，
// 導致 X-Active-Role 過期或漏送——後端為 fail-closed，會直接被限縮或 403。
interface AuthSnapshot {
  token: string | null
  activeRole: string | null
}

let authProvider: (() => AuthSnapshot) | null = null

export function registerAuthProvider(fn: () => AuthSnapshot) {
  authProvider = fn
}

// store 尚未初始化時的後備來源（例如極早期的請求）
function readAuthFromStorage(): AuthSnapshot {
  const raw = localStorage.getItem('auth')
  if (!raw) return { token: null, activeRole: null }
  try {
    const auth = JSON.parse(raw) as { token?: string; activeRole?: string }
    return { token: auth.token ?? null, activeRole: auth.activeRole ?? null }
  } catch {
    return { token: null, activeRole: null }
  }
}

// ── 請求攔截器 ──────────────────────────────────
httpClient.interceptors.request.use((config) => {
  const auth = authProvider ? authProvider() : readAuthFromStorage()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  if (auth.activeRole) {
    config.headers['X-Active-Role'] = auth.activeRole
  }
  // 契約：organizationId 由 JWT 取得，不需 header 注入
  return config
})

// ── 回應攔截器 ──────────────────────────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // 統一解包 ApiResponse<T> → 回傳 .data
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // 防禦：後端多以 HTTP 狀態碼表達失敗，但若 2xx 仍帶 success:false，視為錯誤
      if (!response.data.success) {
        toastFn?.(response.data.message || '操作失敗', 'error')
        return Promise.reject(new Error(response.data.message || '操作失敗'))
      }
      return { ...response, data: response.data.data }
    }
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status as number
      const data = error.response.data as { message?: string } | undefined
      if (status === 401) {
        localStorage.removeItem('auth')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      if (status === 403) {
        // 可能為權限不足，或首次登入未改密碼（契約 4.4）；顯示後端 message
        toastFn?.(data?.message || '權限不足，無法執行此操作', 'warning')
      }
      if (status === 400 || status === 404) {
        toastFn?.(data?.message || '請求無法完成', 'warning')
      }
      if (status >= 500) {
        toastFn?.('伺服器錯誤，請稍後再試', 'error')
      }
    } else if (error.code === 'ECONNABORTED') {
      toastFn?.('請求逾時，請檢查網路連線', 'error')
    } else if (!error.response) {
      toastFn?.('無法連線至伺服器', 'error')
    }
    return Promise.reject(error)
  },
)

// ── 泛型封裝 ────────────────────────────────────
const httpService = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.get<T, AxiosResponse<T>>(url, config).then((r) => r.data)
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.post<T, AxiosResponse<T>>(url, data, config).then((r) => r.data)
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.put<T, AxiosResponse<T>>(url, data, config).then((r) => r.data)
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.patch<T, AxiosResponse<T>>(url, data, config).then((r) => r.data)
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.delete<T, AxiosResponse<T>>(url, config).then((r) => r.data)
  },
}

export default httpService
