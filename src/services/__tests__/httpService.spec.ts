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

  it('5xx 顯示通用訊息，不外洩後端細節', async () => {
    const { http, onToast } = setUp(() => ({ status: 500, data: { success: false, message: 'NullReferenceException' } }))

    await expect(http.get('/clients')).rejects.toBeInstanceOf(AxiosError)
    expect(onToast).toHaveBeenCalledWith('伺服器錯誤，請稍後再試', 'error')
  })
})
