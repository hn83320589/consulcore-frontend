import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'

// 手機寬度下頂部的「登出」被隱藏，手機選單裡也沒有，手機上無法登出
const logout = vi.fn()
vi.mock('@/composables/useAuthActions', () => ({ useAuthActions: () => ({ logout }) }))

const { default: AdminSidebar } = await import('@/components/layout/AdminSidebar.vue')

async function mountSidebar(mobile: boolean) {
  setUpTestPinia()
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { template: '<p/>' } }] })
  await router.push('/admin/dashboard')
  return mount(AdminSidebar, { props: { mobile }, global: { plugins: [router] } })
}

const logoutButton = (w: Awaited<ReturnType<typeof mountSidebar>>) =>
  w.findAll('button').find((b) => b.text() === '登出')

describe('AdminSidebar 登出', () => {
  it('手機選單有登出按鈕', async () => {
    const wrapper = await mountSidebar(true)

    await logoutButton(wrapper)!.trigger('click')

    expect(logout).toHaveBeenCalledOnce()
  })

  it('桌機側欄不重複放登出（頂部已有）', async () => {
    const wrapper = await mountSidebar(false)

    expect(logoutButton(wrapper)).toBeUndefined()
  })
})
