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

// 側欄「晤談紀錄」直接進入新增頁、網址沒有個案：原本沒有地方選個案，送出時 clientProfileId = 0 必然失敗
describe('SessionNoteEditorView 未指定個案', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('列出個案供選擇，選好之前不能存檔，存檔時帶入所選個案', async () => {
    route.query = {}
    const pinia = createTestingPinia({ createSpy: vi.fn })
    const clientStore = useClientStore(pinia)
    clientStore.clients = [{ id: 7, name: '黃思涵' }, { id: 8, name: '吳承翰' }] as ClientProfile[]
    const { useSessionNoteStore } = await import('@/stores/sessionNoteStore')
    const notes = useSessionNoteStore(pinia)
    vi.mocked(notes.createNote).mockResolvedValue({ id: 99 } as never)

    const wrapper = mount(SessionNoteEditorView, { global: { plugins: [pinia] } })
    await flushPromises()
    const saveButton = () => wrapper.findAll('button').find((b) => b.text() === '暫存')!

    expect(clientStore.fetchClients).toHaveBeenCalled()
    expect(saveButton().attributes('disabled')).toBeDefined()

    await wrapper.get('select').setValue('8')
    await saveButton().trigger('click')
    await flushPromises()

    expect(vi.mocked(notes.createNote).mock.calls[0]![0].clientProfileId).toBe(8)
  })
})
