import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import NotificationBell from '@/components/layout/NotificationBell.vue'
import { useNotificationStore } from '@/stores/notificationStore'

// 背景分頁仍每 30 秒打一次未讀數，開著多個分頁時請求量成倍增加
function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('NotificationBell 輪詢', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    setHidden(false)
  })

  function mountBell() {
    const wrapper = mount(NotificationBell, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })], stubs: { RouterLink: true } },
    })
    const store = useNotificationStore()
    vi.mocked(store.fetchUnreadCount).mockClear()
    return { wrapper, store }
  }

  it('前景時每 30 秒更新未讀數', () => {
    const { wrapper, store } = mountBell()

    vi.advanceTimersByTime(60_000)

    expect(store.fetchUnreadCount).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('分頁在背景時不輪詢，回到前景立即更新一次', () => {
    const { wrapper, store } = mountBell()

    setHidden(true)
    vi.advanceTimersByTime(90_000)
    expect(store.fetchUnreadCount).not.toHaveBeenCalled()

    setHidden(false)
    expect(store.fetchUnreadCount).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('卸載後不再輪詢', () => {
    const { wrapper, store } = mountBell()

    wrapper.unmount()
    vi.advanceTimersByTime(60_000)

    expect(store.fetchUnreadCount).not.toHaveBeenCalled()
  })
})
