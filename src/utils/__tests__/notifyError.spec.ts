import { beforeEach, describe, expect, it, vi } from 'vitest'
import { markNotified, notifyError } from '@/utils/notifyError'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import { useUiStore } from '@/stores/uiStore'

// F10：攔截器已顯示後端訊息，頁面的 catch 又顯示一次通用訊息 → 兩個 toast，
// 而且通用訊息蓋過了具體原因
describe('notifyError', () => {
  beforeEach(() => setUpTestPinia())

  it('攔截器已顯示過的錯誤不再顯示', () => {
    const showToast = vi.spyOn(useUiStore(), 'showToast')
    const error = new Error('權限不足')
    markNotified(error)

    notifyError(error, '操作失敗')

    expect(showToast).not.toHaveBeenCalled()
  })

  it('未顯示過的錯誤（例如前端程式錯誤）顯示通用訊息', () => {
    const showToast = vi.spyOn(useUiStore(), 'showToast')

    notifyError(new TypeError('x is undefined'), '操作失敗')

    expect(showToast).toHaveBeenCalledWith('操作失敗', 'error')
  })
})
