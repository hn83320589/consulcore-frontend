import axios, { AxiosHeaders, type AxiosAdapter, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'
import { markNotified } from '@/utils/notifyError'
import { requireApiBaseUrl } from '@/utils/apiBaseUrl'

type ToastType = 'error' | 'warning'

// 必須讀「當下」的 token / activeRole：persist 寫入 localStorage 是非同步的
// （$subscribe flush:'pre'），切換角色後若從 localStorage 讀會拿到舊值，
// 導致 X-Active-Role 過期或漏送——後端為 fail-closed，會直接被限縮或 403。
export interface AuthSnapshot {
  token: string | null
  activeRole: string | null
}

export interface HttpServiceDeps {
  baseURL?: string
  getAuth: () => AuthSnapshot
  onToast: (msg: string, type: ToastType) => void
  /** token 失效（401）時呼叫，負責清除登入狀態並回到登入頁 */
  onSessionExpired: () => void
  /** 測試用：替換實際送出請求的 adapter */
  adapter?: AxiosAdapter
}

export interface HttpService {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export function createHttpService(deps: HttpServiceDeps): HttpService {
  const httpClient = axios.create({
    baseURL: deps.baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
    adapter: deps.adapter,
  })

  // ── 請求攔截器 ──────────────────────────────────
  httpClient.interceptors.request.use((config) => {
    const auth = deps.getAuth()
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
          deps.onToast(response.data.message || '操作失敗', 'error')
          const failure = new Error(response.data.message || '操作失敗')
          markNotified(failure)
          return Promise.reject(failure)
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
          // 只有「帶 token 卻被 JWT 驗證拒絕」（後端回空內容）才是登入過期。
          // 未帶 token（登入失敗）交給呼叫端顯示；帶 ApiResponse 內容的 401 是業務拒絕，不登出。
          const sentToken = !!AxiosHeaders.from(error.config?.headers).get('Authorization')
          const isApiResponse = !!data && typeof data === 'object' && 'success' in data
          if (sentToken && !isApiResponse) {
            deps.onSessionExpired()
          } else if (sentToken) {
            deps.onToast(data?.message || '無法執行此操作', 'warning')
            markNotified(error)
          }
          return Promise.reject(error)
        }
        if (status === 403) {
          // 可能為權限不足，或首次登入未改密碼（契約 4.4）；顯示後端 message
          deps.onToast(data?.message || '權限不足，無法執行此操作', 'warning')
          markNotified(error)
        }
        // 409：併發衝突（例如同一時段剛被別人預約），後端訊息可直接顯示
        if (status === 400 || status === 404 || status === 409) {
          deps.onToast(data?.message || '請求無法完成', 'warning')
          markNotified(error)
        }
        if (status >= 500) {
          deps.onToast('伺服器錯誤，請稍後再試', 'error')
          markNotified(error)
        }
      } else if (error.code === 'ECONNABORTED') {
        deps.onToast('請求逾時，請檢查網路連線', 'error')
        markNotified(error)
      } else if (!error.response) {
        deps.onToast('無法連線至伺服器', 'error')
        markNotified(error)
      }
      return Promise.reject(error)
    },
  )

  // ── 泛型封裝 ────────────────────────────────────
  return {
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
}

// ── 應用程式使用的預設實例 ─────────────────────────
// toast 由 main.ts 在 Pinia 初始化後註冊；認證狀態由 authStore 註冊
let toastFn: ((msg: string, type: ToastType) => void) | null = null

export function registerToast(fn: (msg: string, type: ToastType) => void) {
  toastFn = fn
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

const httpService = createHttpService({
  baseURL: requireApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  getAuth: () => (authProvider ? authProvider() : readAuthFromStorage()),
  onToast: (msg, type) => toastFn?.(msg, type),
  onSessionExpired: () => {
    localStorage.removeItem('auth')
    window.location.href = '/login'
  },
})

export default httpService
