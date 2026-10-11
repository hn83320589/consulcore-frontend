import { describe, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import { parseLoginError } from '@/utils/loginError'

function axiosError(status: number, data?: unknown) {
  return new AxiosError('failed', AxiosError.ERR_BAD_REQUEST, undefined, {}, {
    status, statusText: '', data, headers: {}, config: { headers: {} } as never,
  })
}

describe('parseLoginError', () => {
  it('401 優先顯示後端訊息（帳號停用、機構停用也是 401）', () => {
    expect(parseLoginError(axiosError(401, { success: false, message: '帳號已停用' }))).toBe('帳號已停用')
  })

  it('401 沒有訊息時顯示帳密錯誤', () => {
    expect(parseLoginError(axiosError(401))).toBe('帳號或密碼錯誤')
  })

  it('429 提示稍後再試', () => {
    expect(parseLoginError(axiosError(429))).toBe('登入嘗試過於頻繁，請稍後再試')
  })

  it('沒有回應時提示檢查網路', () => {
    expect(parseLoginError('boom')).toBe('登入失敗，請檢查網路連線')
  })
})
