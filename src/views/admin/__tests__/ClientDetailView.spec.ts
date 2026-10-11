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
