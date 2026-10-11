import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import type { ClientProfile } from '@/types'

const route = { params: {} as Record<string, string>, query: { clientId: '3' } as Record<string, string> }
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  onBeforeRouteLeave: vi.fn(),
}))

const { default: SessionNoteEditorView } = await import('@/views/admin/SessionNoteEditorView.vue')
const { useClientStore } = await import('@/stores/clientStore')

// F7：個案姓名原本放在 URL query（clientName），會留在瀏覽器歷史與 Referer
describe('SessionNoteEditorView 新增紀錄', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('個案姓名取自 store，不從網址讀', async () => {
    route.query = { clientId: '3', clientName: '網址裡的名字' }
    const pinia = createTestingPinia({ createSpy: vi.fn })
    useClientStore(pinia).currentClient = { id: 3, name: '王小明' } as ClientProfile

    const wrapper = mount(SessionNoteEditorView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(wrapper.text()).toContain('王小明')
    expect(wrapper.text()).not.toContain('網址裡的名字')
  })

  it('store 裡不是這位個案時，向後端取得', async () => {
    route.query = { clientId: '3' }
    const pinia = createTestingPinia({ createSpy: vi.fn })

    mount(SessionNoteEditorView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(useClientStore(pinia).fetchClient).toHaveBeenCalledWith(3)
  })
})
