import { AxiosError } from 'axios'

export function parseLoginError(e: unknown): string {
  if (e instanceof AxiosError && e.response) {
    const status = e.response.status
    const data = e.response.data as { message?: string } | undefined
    // 帳號停用、機構停用也回 401，優先顯示後端訊息
    if (status === 401) return data?.message ?? '帳號或密碼錯誤'
    if (status === 403) return data?.message ?? '此帳號已被停用，請聯繫管理員'
    if (status === 429) return '登入嘗試過於頻繁，請稍後再試'
    return data?.message ?? '登入失敗，請稍後再試'
  }
  if (e instanceof Error) return e.message
  return '登入失敗，請檢查網路連線'
}
