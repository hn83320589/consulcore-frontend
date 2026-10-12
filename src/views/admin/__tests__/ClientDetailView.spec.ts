import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import type { RoleCode } from '@/types'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '3' }, query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}))

const { default: ClientDetailView } = await import('@/views/admin/ClientDetailView.vue')
const { useAuthStore } = await import('@/stores/authStore')
const { useBillingStore } = await import('@/stores/billingStore')
const { useSessionNoteStore } = await import('@/stores/sessionNoteStore')
const { useClientStore } = await import('@/stores/clientStore')

async function mountAs(activeRole: RoleCode, permissions: string[], failing: 'clientPackages' | null = null) {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })
  const auth = useAuthStore(pinia)
  auth.activeRole = activeRole
  auth.permissions = permissions
  // stubActions 也會替換掉 hasPermission（setup store 的函式），需給回真實判斷
  vi.mocked(auth.hasPermission).mockImplementation((code: string) => permissions.includes(code))
  if (failing === 'clientPackages') {
    vi.mocked(useBillingStore(pinia).fetchClientPackages).mockRejectedValue(new Error('403'))
  }
  const errorHandler = vi.fn()
  mount(ClientDetailView, { global: { plugins: [pinia], config: { errorHandler } }, attachTo: document.body })
  await flushPromises()
  return {
    billing: useBillingStore(pinia), notes: useSessionNoteStore(pinia), client: useClientStore(pinia), errorHandler,
  }
}

describe('ClientDetailView 載入資料', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('沒有 billing.view 的心理師不抓收費資料（避免 403）', async () => {
    const { billing, notes } = await mountAs('therapist', ['client.view'])

    expect(billing.fetchRecords).not.toHaveBeenCalled()
    expect(billing.fetchClientPackages).not.toHaveBeenCalled()
    expect(notes.fetchNotesByClient).toHaveBeenCalledWith(3)
  })

  it('owner 不抓晤談紀錄與備忘（臨床私密資料）', async () => {
    const { billing, notes } = await mountAs('owner', ['client.view', 'billing.view'])

    expect(notes.fetchNotesByClient).not.toHaveBeenCalled()
    expect(notes.fetchMemos).not.toHaveBeenCalled()
    expect(billing.fetchRecords).toHaveBeenCalled()
  })

  // 原本用 Promise.all：任一請求失敗，整個 onMounted 拋出未處理的錯誤
  it('其中一項資料載入失敗時，頁面不會拋出未處理的錯誤', async () => {
    const { client, errorHandler } = await mountAs('owner', ['client.view', 'billing.view'], 'clientPackages')

    expect(client.fetchClient).toHaveBeenCalledWith(3)
    expect(errorHandler).not.toHaveBeenCalled()
  })
})

describe('ClientDetailView 預約紀錄', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // 「查看」原本接到空函式，按了沒有反應
  it('按「查看」開啟預約詳情，只供檢視（狀態變更在預約管理）', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })
    const auth = useAuthStore(pinia)
    auth.activeRole = 'owner'
    vi.mocked(auth.hasPermission).mockReturnValue(true)
    useClientStore(pinia).currentClient = { id: 3, name: '李品妤', status: 'active', therapists: [] } as never
    const { useAppointmentStore } = await import('@/stores/appointmentStore')
    useAppointmentStore(pinia).appointments = [{
      id: 21, clientProfileId: 3, clientName: '李品妤', therapistName: '陳怡君', date: '2026-10-14',
      startTime: '14:00', endTime: '14:50', roomName: '晨曦室', status: 'scheduled',
      sessionType: 'individual', visitType: 'follow_up', hints: [],
    }] as never
    mount(ClientDetailView, { global: { plugins: [pinia] }, attachTo: document.body })
    await flushPromises()

    const button = (text: string) => [...document.body.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)
    ;([...document.body.querySelectorAll('[role=tab]')].find((t) => t.textContent?.includes('預約紀錄')) as HTMLElement).click()
    await flushPromises()
    button('查看')!.click()
    await flushPromises()

    expect(document.body.textContent).toContain('#21')
    expect(document.body.textContent).toContain('晨曦室')
    expect(button('完成')).toBeUndefined()
  })
})
