import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { createHttpService, type AuthSnapshot } from '@/services/httpService'

interface FakeResponse {
  status: number
  data?: unknown
}

// 以假 adapter 取代網路：記錄送出的請求，並依 status 回傳成功或 AxiosError（同 axios 內建行為）
function fakeAdapter(respond: (config: InternalAxiosRequestConfig) => FakeResponse) {
  const requests: InternalAxiosRequestConfig[] = []
  const adapter: AxiosAdapter = async (config) => {
    requests.push(config)
    const { status, data } = respond(config)
    const response = { status, statusText: String(status), data, headers: {}, config, request: {} }
    if (status >= 200 && status < 300) return response
    throw new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_RESPONSE, config, {}, response)
  }
  return { adapter, requests }
}

function setUp(respond: (config: InternalAxiosRequestConfig) => FakeResponse, auth: AuthSnapshot = { token: 'jwt', activeRole: 'therapist' }) {
  const { adapter, requests } = fakeAdapter(respond)
  const onToast = vi.fn()
  const onSessionExpired = vi.fn()
  const http = createHttpService({ getAuth: () => auth, onToast, onSessionExpired, adapter })
  return { http, requests, onToast, onSessionExpired }
}

describe('httpService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('帶上當下的 token 與作用中角色', async () => {
    const { http, requests } = setUp(() => ({ status: 200, data: { success: true, data: [] } }))

    await http.get('/clients')

    const headers = AxiosHeaders.from(requests[0]!.headers)
    expect(headers.get('Authorization')).toBe('Bearer jwt')
    expect(headers.get('X-Active-Role')).toBe('therapist')
  })

  it('解包 ApiResponse，直接回傳 data', async () => {
    const { http } = setUp(() => ({ status: 200, data: { success: true, message: 'ok', data: { id: 1 } } }))

    await expect(http.get('/clients/1')).resolves.toEqual({ id: 1 })
  })

  it('2xx 但 success:false 視為錯誤並顯示訊息', async () => {
    const { http, onToast } = setUp(() => ({ status: 200, data: { success: false, message: '資料有誤' } }))

    await expect(http.post('/clients', {})).rejects.toThrow('資料有誤')
    expect(onToast).toHaveBeenCalledWith('資料有誤', 'error')
  })

  it('已登入的請求收到 JWT 驗證失敗的 401（無內容）→ 視為登入過期', async () => {
    const { http, onSessionExpired } = setUp(() => ({ status: 401 }))

    await expect(http.get('/clients')).rejects.toBeInstanceOf(AxiosError)
    expect(onSessionExpired).toHaveBeenCalledOnce()
  })

  // F3：登入失敗的 401 原本會整頁跳轉，LoginView 的「帳號或密碼錯誤」來不及顯示
  it('未帶 token 的請求（登入）收到 401：不視為登入過期，交由呼叫端顯示錯誤', async () => {
    const { http, onSessionExpired } = setUp(
      () => ({ status: 401, data: { success: false, message: '帳號或密碼錯誤' } }),
      { token: null, activeRole: null },
    )

    await expect(http.post('/auth/login', {})).rejects.toBeInstanceOf(AxiosError)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  // F3：後端以 401 表達「非紀錄建立者」等業務拒絕（帶 ApiResponse 內容），不應把人登出
  it('已登入的請求收到帶 ApiResponse 內容的 401：顯示訊息，不登出', async () => {
    const { http, onToast, onSessionExpired } = setUp(
      () => ({ status: 401, data: { success: false, message: '只有紀錄建立者可以編輯' } }),
    )

    await expect(http.put('/session-notes/3', {})).rejects.toBeInstanceOf(AxiosError)
    expect(onSessionExpired).not.toHaveBeenCalled()
    expect(onToast).toHaveBeenCalledWith('只有紀錄建立者可以編輯', 'warning')
  })

  it('403 顯示後端訊息，不登出', async () => {
    const { http, onToast, onSessionExpired } = setUp(() => ({ status: 403, data: { success: false, message: '權限不足' } }))

    await expect(http.get('/users')).rejects.toBeInstanceOf(AxiosError)
    expect(onToast).toHaveBeenCalledWith('權限不足', 'warning')
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('400 / 404 顯示後端訊息', async () => {
    const { http, onToast } = setUp(() => ({ status: 404, data: { success: false, message: '找不到個案' } }))

    await expect(http.get('/clients/9')).rejects.toBeInstanceOf(AxiosError)
    expect(onToast).toHaveBeenCalledWith('找不到個案', 'warning')
  })

  // B7：後端對同時預約同一時段等併發衝突回 409
  it('409 顯示後端訊息（例如時段剛被別人預約）', async () => {
    const { http, onToast } = setUp(() => ({ status: 409, data: { success: false, message: '資料剛被其他人更新' } }))

    await expect(http.post('/appointments', {})).rejects.toBeInstanceOf(AxiosError)
    expect(onToast).toHaveBeenCalledWith('資料剛被其他人更新', 'warning')
  })

  it('5xx 顯示通用訊息，不外洩後端細節', async () => {
    const { http, onToast } = setUp(() => ({ status: 500, data: { success: false, message: 'NullReferenceException' } }))

    await expect(http.get('/clients')).rejects.toBeInstanceOf(AxiosError)
    expect(onToast).toHaveBeenCalledWith('伺服器錯誤，請稍後再試', 'error')
  })
})
