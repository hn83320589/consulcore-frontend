import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { useLeaveGuard } from '@/composables/useLeaveGuard'

// F8：晤談紀錄編輯器沒有「未存檔離開」保護，臨床紀錄可能遺失
const dirty = ref(false)
let guard: ReturnType<typeof useLeaveGuard>

const Editor = defineComponent({
  setup() {
    guard = useLeaveGuard(() => dirty.value)
    return () => h('div', 'editor')
  },
})

async function setUp() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/editor', component: Editor },
      { path: '/other', component: { render: () => h('div', 'other') } },
    ],
  })
  await router.push('/editor')
  const wrapper = mount({ render: () => h(RouterView) }, { global: { plugins: [router] } })
  await flushPromises()
  return { router, wrapper }
}

describe('useLeaveGuard', () => {
  afterEach(() => {
    dirty.value = false
  })

  it('沒有未存檔內容時直接離開', async () => {
    const { router } = await setUp()

    await router.push('/other')

    expect(router.currentRoute.value.path).toBe('/other')
  })

  it('有未存檔內容時先詢問，取消就留在原頁', async () => {
    const { router } = await setUp()
    dirty.value = true

    const navigation = router.push('/other')
    await flushPromises()
    expect(guard.leavePending.value).toBe(true)
    guard.cancelLeave()
    await navigation

    expect(router.currentRoute.value.path).toBe('/editor')
    expect(guard.leavePending.value).toBe(false)
  })

  it('確認放棄後才離開', async () => {
    const { router } = await setUp()
    dirty.value = true

    const navigation = router.push('/other')
    await flushPromises()
    guard.confirmLeave()
    await navigation

    expect(router.currentRoute.value.path).toBe('/other')
  })

  it('關閉或重新整理分頁時，有未存檔內容就要求瀏覽器確認', async () => {
    await setUp()
    dirty.value = true
    const event = new Event('beforeunload', { cancelable: true })

    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })
})
