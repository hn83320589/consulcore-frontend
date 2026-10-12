import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import type { RoleCode, UserResponse } from '@/types'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/services/staffService', () => ({
  default: {
    getUsers: vi.fn(),
    getRoles: vi.fn().mockResolvedValue([]),
    updateUser: vi.fn(),
  },
}))

const { default: staffService } = await import('@/services/staffService')
const { useAuthStore } = await import('@/stores/authStore')
const { useStaffStore } = await import('@/stores/staffStore')
const { default: StaffManageView } = await import('@/views/admin/StaffManageView.vue')

function user(id: number, roles: string[]): UserResponse {
  return {
    id, username: `u${id}`, email: `u${id}@test.local`, displayName: `使用者${id}`,
    isActive: true, roles, createdAt: '', updatedAt: '',
  }
}

async function render(activeRole: RoleCode) {
  setUpTestPinia()
  useAuthStore().activeRole = activeRole
  vi.mocked(staffService.getUsers).mockResolvedValue([user(1, ['owner']), user(2, ['therapist'])])
  const wrapper = mount(StaffManageView, { attachTo: document.body })
  await flushPromises()
  return wrapper
}

function clickButton(text: string, nth = 0) {
  const buttons = [...document.body.querySelectorAll('button')].filter((b) => b.textContent?.trim() === text)
  buttons[nth]!.click()
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

describe('StaffManageView 編輯沒有 Email 的帳號', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // 兼具個案身份的帳號可能沒有 Email；送空字串會被後端的 Email 格式驗證擋下，null 表示不變更
  it('Email 留空時送出 null', async () => {
    await render('owner')
    const noEmail = { ...user(3, ['therapist', 'client']), email: null }
    vi.mocked(staffService.getUsers).mockResolvedValue([noEmail])
    await useStaffStore().fetchUsers()
    await flushPromises()
    vi.mocked(staffService.updateUser).mockResolvedValue(noEmail)

    clickButton('編輯')
    await flushPromises()
    clickButton('儲存')
    await flushPromises()

    expect(vi.mocked(staffService.updateUser).mock.calls[0]![1].email).toBeNull()
  })
})

describe('StaffManageView 人員清單', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // 角色原本顯示代碼 therapist；個案帳號也列在「人員」清單
  it('角色顯示中文，只有個案身份的帳號不列出', async () => {
    setUpTestPinia()
    useAuthStore().activeRole = 'owner'
    vi.mocked(staffService.getUsers).mockResolvedValue([
      user(1, ['owner']), user(2, ['therapist', 'client']), user(3, ['client']),
    ])
    const wrapper = mount(StaffManageView, { attachTo: document.body })
    await flushPromises()

    expect(wrapper.text()).toContain('機構負責人')
    expect(wrapper.text()).toContain('心理師、個案')
    expect(wrapper.text()).not.toContain('使用者3')
  })
})
