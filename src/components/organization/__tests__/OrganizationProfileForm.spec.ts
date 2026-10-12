import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'

// 機構設定頁原本只有表單範本，開設機構後名稱、電話、Email、地址都改不了
vi.mock('@/services/organizationService', () => ({
  default: { getOrganization: vi.fn(), updateOrganization: vi.fn() },
}))

const { default: organizationService } = await import('@/services/organizationService')
const { useAuthStore } = await import('@/stores/authStore')
const { default: OrganizationProfileForm } = await import('@/components/organization/OrganizationProfileForm.vue')

const org = {
  id: 1, name: '晴光心理諮商所', phone: '0912000001', email: 'owner@demo.local', address: null,
  createdAt: '', updatedAt: '',
}

describe('OrganizationProfileForm', () => {
  it('載入目前資料，儲存後更新頁首顯示的機構名稱', async () => {
    setUpTestPinia()
    const auth = useAuthStore()
    auth.user = { id: 1, username: 'o', displayName: 'O', organizationId: 1, organizationName: '晴光心理諮商所' }
    vi.mocked(organizationService.getOrganization).mockResolvedValue(org)
    vi.mocked(organizationService.updateOrganization).mockImplementation(async (p) => ({ ...org, ...p }) as never)

    const wrapper = mount(OrganizationProfileForm, { attachTo: document.body })
    await flushPromises()
    const inputs = wrapper.findAll('input')
    expect((inputs[0]!.element as HTMLInputElement).value).toBe('晴光心理諮商所')

    await inputs[0]!.setValue('晴光心理諮商所（信義）')
    await inputs[3]!.setValue('台北市信義區松仁路 100 號')
    await wrapper.findAll('button').find((b) => b.text() === '儲存')!.trigger('click')
    await flushPromises()

    expect(organizationService.updateOrganization).toHaveBeenCalledWith({
      name: '晴光心理諮商所（信義）', phone: '0912000001', email: 'owner@demo.local', address: '台北市信義區松仁路 100 號',
    })
    expect(auth.user!.organizationName).toBe('晴光心理諮商所（信義）')
    wrapper.unmount()
  })

  it('名稱空白時不能儲存', async () => {
    setUpTestPinia()
    vi.mocked(organizationService.getOrganization).mockResolvedValue(org)

    const wrapper = mount(OrganizationProfileForm)
    await flushPromises()
    await wrapper.findAll('input')[0]!.setValue('  ')

    expect(wrapper.findAll('button').find((b) => b.text() === '儲存')!.attributes('disabled')).toBeDefined()
  })
})
