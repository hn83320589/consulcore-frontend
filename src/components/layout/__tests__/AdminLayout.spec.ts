import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import { useUiStore } from '@/stores/uiStore'
import AdminLayout from '@/components/layout/AdminLayout.vue'

// RWD：手機選單原本與桌機「側欄收合」共用同一個狀態，桌機預設展開 → 手機每次載入都是選單打開、蓋住內容
const Page = { template: '<p>page</p>' }

async function mountLayout() {
  setUpTestPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/a', component: Page }, { path: '/b', component: Page }],
  })
  await router.push('/a')
  const wrapper = mount(AdminLayout, {
    global: {
      plugins: [router],
      stubs: { AdminSidebar: true, RoleSwitcher: true, NotificationBell: true },
    },
  })
  return { wrapper, router }
}

const mobileNav = (wrapper: Awaited<ReturnType<typeof mountLayout>>['wrapper']) => wrapper.find('[data-testid="mobile-nav"]')

describe('AdminLayout 手機選單', () => {
  beforeEach(() => setUpTestPinia())

  it('預設關閉', async () => {
    const { wrapper } = await mountLayout()

    expect(mobileNav(wrapper).exists()).toBe(false)
  })

  it('按選單按鈕打開，點背景關閉', async () => {
    const { wrapper } = await mountLayout()

    await wrapper.get('[aria-label="開啟選單"]').trigger('click')
    expect(mobileNav(wrapper).exists()).toBe(true)

    await wrapper.get('[data-testid="mobile-nav-backdrop"]').trigger('click')
    expect(mobileNav(wrapper).exists()).toBe(false)
  })

  it('換頁後自動關閉', async () => {
    const { wrapper, router } = await mountLayout()
    await wrapper.get('[aria-label="開啟選單"]').trigger('click')

    await router.push('/b')
    await wrapper.vm.$nextTick()

    expect(mobileNav(wrapper).exists()).toBe(false)
  })

  it('桌機側欄收合 / 展開不會打開手機選單', async () => {
    const { wrapper } = await mountLayout()
    const ui = useUiStore()

    ui.toggleSidebar()
    await wrapper.vm.$nextTick()
    ui.toggleSidebar()
    await wrapper.vm.$nextTick()

    expect(mobileNav(wrapper).exists()).toBe(false)
  })
})
