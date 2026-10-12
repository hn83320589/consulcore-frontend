import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/services/notificationService', () => ({
  default: { getPreferences: vi.fn().mockResolvedValue([]) },
}))

const { useAuthStore } = await import('@/stores/authStore')
const { default: ClientSettingsView } = await import('@/views/client/ClientSettingsView.vue')

async function renderWithEmail(email: string | null) {
  setUpTestPinia()
  useAuthStore().user = {
    id: 1, username: 'client_1', displayName: '小明', email, organizationId: 1, organizationName: '診所',
  }
  const wrapper = mount(ClientSettingsView)
  await flushPromises()
  return wrapper
}

describe('ClientSettingsView 個人資料', () => {
  // 個案帳號建立時沒填 Email，原本顯示系統產生的 placeholder.local 假地址
  it('沒有 Email 時顯示「未設定」', async () => {
    const wrapper = await renderWithEmail(null)

    expect(wrapper.text()).toContain('Email：未設定')
  })

  it('有 Email 時照常顯示', async () => {
    const wrapper = await renderWithEmail('someone@example.com')

    expect(wrapper.text()).toContain('Email：someone@example.com')
  })
})
