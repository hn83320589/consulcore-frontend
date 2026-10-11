import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { RoleCode, UserResponse } from '@/types'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/services/staffService', () => ({
  default: {
    getUsers: vi.fn(),
    getRoles: vi.fn().mockResolvedValue([]),
  },
}))

const { default: staffService } = await import('@/services/staffService')
const { useAuthStore } = await import('@/stores/authStore')
const { default: StaffManageView } = await import('@/views/admin/StaffManageView.vue')

function user(id: number, roles: string[]): UserResponse {
  return {
    id, username: `u${id}`, email: `u${id}@test.local`, displayName: `使用者${id}`,
    isActive: true, roles, createdAt: '', updatedAt: '',
  }
}

async function render(activeRole: RoleCode) {
  setActivePinia(createPinia())
  useAuthStore().activeRole = activeRole
  vi.mocked(staffService.getUsers).mockResolvedValue([user(1, ['owner']), user(2, ['therapist'])])
  const wrapper = mount(StaffManageView, { attachTo: document.body })
  await flushPromises()
  return wrapper
}

function resetButtonsCount() {
  return [...document.body.querySelectorAll('button')].filter((b) => b.textContent?.trim() === '重設密碼').length
}

describe('StaffManageView 擁有者帳號', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('admin 看不到擁有者那一列的管理按鈕', async () => {
    await render('admin')

    expect(resetButtonsCount()).toBe(1)
  })

  it('owner 可以管理所有人員', async () => {
    await render('owner')

    expect(resetButtonsCount()).toBe(2)
  })
})
