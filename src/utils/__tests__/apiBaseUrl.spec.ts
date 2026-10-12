import { describe, expect, it } from 'vitest'
import { requireApiBaseUrl } from '@/utils/apiBaseUrl'

// 沒設定 VITE_API_BASE_URL 時 axios 會改打前端自己的網域，所有 API 都 404，很難看出原因
describe('requireApiBaseUrl', () => {
  it.each([undefined, '', '   '])('未設定（%j）時直接報錯並指出變數名稱', (value) => {
    expect(() => requireApiBaseUrl(value)).toThrow(/VITE_API_BASE_URL/)
  })

  it('有設定時原樣回傳', () => {
    expect(requireApiBaseUrl('http://localhost:5037/api')).toBe('http://localhost:5037/api')
  })
})
