import { useUiStore } from '@/stores/uiStore'

// httpService 攔截器顯示過訊息的錯誤（後端的具體原因），頁面不必再顯示通用訊息
const notified = new WeakSet<object>()

export function markNotified(error: unknown) {
  if (typeof error === 'object' && error !== null) notified.add(error)
}

export function isNotified(error: unknown): boolean {
  return typeof error === 'object' && error !== null && notified.has(error)
}

/**
 * 頁面 catch 區塊用：攔截器已顯示過的錯誤略過，其他錯誤（非 API 錯誤、
 * 攔截器未處理的情況）才顯示 fallback 訊息，避免同一個錯誤出現兩個 toast。
 */
export function notifyError(error: unknown, fallback: string) {
  if (isNotified(error)) return
  useUiStore().showToast(fallback, 'error')
}
