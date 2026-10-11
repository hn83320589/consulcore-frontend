import { describe, expect, it } from 'vitest'
import type { RouteMeta } from 'vue-router'
import { needsPermissionLoad, resolveNavigation, type NavigationAuth } from '@/router/navigation'
import type { RoleCode } from '@/types'

function auth(overrides: Partial<NavigationAuth> & { permissions?: string[] } = {}): NavigationAuth {
  const permissions = overrides.permissions ?? ['client.view']
  return {
    isAuthenticated: true,
    mustChangePassword: false,
    activeRole: 'owner',
    hasPermission: (code) => permissions.includes(code),
    ...overrides,
  }
}

const adminPage = (meta: Partial<RouteMeta> = {}) => ({ name: 'Page', meta: { roles: ['owner', 'admin', 'therapist'] as RoleCode[], ...meta } })
const clientPage = { name: 'ClientDashboard', meta: { roles: ['client'] as RoleCode[] } }
const loginPage = { name: 'Login', meta: { requiresAuth: false } }

// R10：守衛的判斷抽成純函式，以表格涵蓋所有情境
describe('resolveNavigation', () => {
  it.each([
    ['未登入進受保護頁 → 登入頁', adminPage(), auth({ isAuthenticated: false, activeRole: null }), '/login'],
    ['未登入進登入頁 → 放行', loginPage, auth({ isAuthenticated: false, activeRole: null }), true],
    ['已登入且已選角色進登入頁 → 角色首頁', loginPage, auth({ activeRole: 'therapist' }), '/admin/dashboard'],
    ['需改密碼 → 改密碼頁', adminPage(), auth({ mustChangePassword: true }), '/change-password'],
    ['需改密碼時可以停在改密碼頁', { name: 'ChangePassword', meta: {} }, auth({ mustChangePassword: true }), true],
    ['尚未選角色 → 選角色頁', adminPage(), auth({ activeRole: null }), '/select-role'],
    ['尚未選角色時可以停在選角色頁', { name: 'RoleSelect', meta: {} }, auth({ activeRole: null }), true],
    ['個案進後台 → 個案首頁', adminPage(), auth({ activeRole: 'client' }), '/client/dashboard'],
    ['機構角色進個案端 → 後台首頁', clientPage, auth({ activeRole: 'therapist' }), '/admin/dashboard'],
    ['有權限 → 放行', adminPage({ permission: 'client.view' }), auth(), true],
  ])('%s', (_, to, state, expected) => {
    const result = resolveNavigation(to, state)

    expect(result === true ? true : result.redirect).toBe(expected)
  })

  it('缺少頁面權限 → 角色首頁，並附上提示', () => {
    const result = resolveNavigation(adminPage({ permission: 'audit.view' }), auth({ activeRole: 'therapist' }))

    expect(result).toEqual({ redirect: '/admin/dashboard', notice: '權限不足，無法進入此頁面' })
  })
})

describe('needsPermissionLoad', () => {
  it.each([
    ['已登入、已選角色、權限還沒載入 → 需要', adminPage(), auth(), [], true],
    ['權限已載入 → 不需要', adminPage(), auth(), ['client.view'], false],
    ['未登入 → 不需要', adminPage(), auth({ isAuthenticated: false }), [], false],
    ['需改密碼 → 不需要（只能去改密碼頁）', adminPage(), auth({ mustChangePassword: true }), [], false],
    ['尚未選角色 → 不需要', adminPage(), auth({ activeRole: null }), [], false],
    ['不需登入的頁面 → 不需要', loginPage, auth(), [], false],
  ])('%s', (_, to, state, loaded, expected) => {
    expect(needsPermissionLoad(to, state, loaded.length > 0)).toBe(expected)
  })
})
