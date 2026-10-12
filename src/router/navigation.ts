import type { RouteMeta, RouteRecordNameGeneric } from 'vue-router'
import type { RoleCode } from '@/types'

/** 路由守衛需要的登入狀態（由 authStore 提供，測試可直接給值） */
export interface NavigationAuth {
  isAuthenticated: boolean
  mustChangePassword: boolean
  activeRole: RoleCode | null
  hasPermission: (code: string) => boolean
}

export interface NavigationTarget {
  name?: RouteRecordNameGeneric
  meta: RouteMeta
}

export type NavigationResult = true | { redirect: string; notice?: string }

export function dashboardPathFor(role: RoleCode): string {
  return role === 'client' ? '/client/dashboard' : '/admin/dashboard'
}

/** 進入受保護頁之前，是否要先向 /me 補抓權限（重整後 permissions 不持久化） */
export function needsPermissionLoad(to: NavigationTarget, auth: NavigationAuth, permissionsLoaded: boolean): boolean {
  return to.meta.requiresAuth !== false
    && auth.isAuthenticated
    && !auth.mustChangePassword
    && auth.activeRole !== null
    && !permissionsLoaded
}

/** 依登入狀態決定放行或導向何處（權限須已載入） */
export function resolveNavigation(to: NavigationTarget, auth: NavigationAuth): NavigationResult {
  // 任何狀態都可看的頁面（404）
  if (to.meta.public) return true

  // 不需登入的頁面（登入頁）：已登入且已選角色就直接回首頁
  if (to.meta.requiresAuth === false) {
    return auth.isAuthenticated && auth.activeRole ? { redirect: dashboardPathFor(auth.activeRole) } : true
  }

  if (!auth.isAuthenticated) return { redirect: '/login' }

  // 首次登入強制改密碼（契約 4.4）：鎖定只能停在改密碼頁
  if (auth.mustChangePassword) return to.name === 'ChangePassword' ? true : { redirect: '/change-password' }

  // 多角色尚未選擇作用中角色
  if (!auth.activeRole) return to.name === 'RoleSelect' ? true : { redirect: '/select-role' }

  const home = dashboardPathFor(auth.activeRole)
  if (to.meta.roles && !to.meta.roles.includes(auth.activeRole)) return { redirect: home }

  // 頁面權限碼：側欄隱藏不等於擋下，直接輸入網址也要擋
  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return { redirect: home, notice: '權限不足，無法進入此頁面' }
  }

  return true
}
