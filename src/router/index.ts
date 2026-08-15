import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { RoleCode } from '@/types'

// ── Views ──────────────────────────────────────
import LoginView from '@/views/LoginView.vue'
import RoleSelectView from '@/views/RoleSelectView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'

// Layouts
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ClientLayout from '@/components/layout/ClientLayout.vue'

// Admin Views
import DashboardView from '@/views/admin/DashboardView.vue'
import StaffManageView from '@/views/admin/StaffManageView.vue'
import ClientListView from '@/views/admin/ClientListView.vue'
import ClientDetailView from '@/views/admin/ClientDetailView.vue'
import ConsentManageView from '@/views/admin/ConsentManageView.vue'
import RoomSettingView from '@/views/admin/RoomSettingView.vue'
import ScheduleManageView from '@/views/admin/ScheduleManageView.vue'
import AppointmentManageView from '@/views/admin/AppointmentManageView.vue'
import SessionNoteEditorView from '@/views/admin/SessionNoteEditorView.vue'
import FeeSettingView from '@/views/admin/FeeSettingView.vue'
import BillingManageView from '@/views/admin/BillingManageView.vue'
import NotificationTemplateView from '@/views/admin/NotificationTemplateView.vue'
import PerformanceView from '@/views/admin/PerformanceView.vue'
import AuditLogView from '@/views/admin/AuditLogView.vue'
import OrgSettingView from '@/views/admin/OrgSettingView.vue'

// Client Views
import ClientDashboardView from '@/views/client/ClientDashboardView.vue'
import ClientConsentView from '@/views/client/ClientConsentView.vue'
import ClientAppointmentView from '@/views/client/ClientAppointmentView.vue'
import ClientNewAppointmentView from '@/views/client/ClientNewAppointmentView.vue'
import ClientNotificationView from '@/views/client/ClientNotificationView.vue'
import ClientSettingsView from '@/views/client/ClientSettingsView.vue'

// ── Route Meta 型別擴展 ─────────────────────────
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: RoleCode[]
    title?: string
  }
}

// ── Routes ─────────────────────────────────────
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, title: '登入' },
  },
  {
    path: '/select-role',
    name: 'RoleSelect',
    component: RoleSelectView,
    meta: { requiresAuth: true, title: '選擇身份' },
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePasswordView,
    meta: { requiresAuth: true, title: '變更密碼' },
  },

  // ── Admin Routes ───────────────────��─────────
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['owner', 'therapist', 'admin'] },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: DashboardView, meta: { title: '儀表板' } },
      { path: 'staff', name: 'StaffManage', component: StaffManageView, meta: { title: '人員管理' } },
      { path: 'clients', name: 'ClientList', component: ClientListView, meta: { title: '個案管理' } },
      { path: 'clients/:id', name: 'ClientDetail', component: ClientDetailView, meta: { title: '個案詳情' } },
      { path: 'consents', name: 'ConsentManage', component: ConsentManageView, meta: { title: '同意書管理' } },
      { path: 'rooms', name: 'RoomSetting', component: RoomSettingView, meta: { title: '診間設定' } },
      { path: 'schedule', name: 'ScheduleManage', component: ScheduleManageView, meta: { title: '排班管理' } },
      { path: 'appointments', name: 'AppointmentManage', component: AppointmentManageView, meta: { title: '預約管理' } },
      { path: 'sessions/new', name: 'SessionNoteNew', component: SessionNoteEditorView, meta: { title: '新增晤談紀錄' } },
      { path: 'sessions/:id/edit', name: 'SessionNoteEdit', component: SessionNoteEditorView, meta: { title: '編輯晤談紀錄' } },
      { path: 'fee-settings', name: 'FeeSetting', component: FeeSettingView, meta: { title: '費率設定' } },
      { path: 'billing', name: 'BillingManage', component: BillingManageView, meta: { title: '收費管理' } },
      { path: 'notifications', name: 'NotificationTemplate', component: NotificationTemplateView, meta: { title: '通知範本' } },
      { path: 'performance', name: 'Performance', component: PerformanceView, meta: { title: '考核管理' } },
      { path: 'audit-log', name: 'AuditLog', component: AuditLogView, meta: { title: '稽核紀錄' } },
      { path: 'settings', name: 'OrgSetting', component: OrgSettingView, meta: { title: '機構設定' } },
    ],
  },

  // ── Client Routes ────────────────────────────
  {
    path: '/client',
    component: ClientLayout,
    meta: { requiresAuth: true, roles: ['client'] },
    children: [
      { path: 'dashboard', name: 'ClientDashboard', component: ClientDashboardView, meta: { title: '首頁' } },
      { path: 'consents', name: 'ClientConsent', component: ClientConsentView, meta: { title: '同意書' } },
      { path: 'appointments', name: 'ClientAppointments', component: ClientAppointmentView, meta: { title: '我的預約' } },
      { path: 'appointments/new', name: 'ClientNewAppointment', component: ClientNewAppointmentView, meta: { title: '預約諮商' } },
      { path: 'notifications', name: 'ClientNotifications', component: ClientNotificationView, meta: { title: '通知' } },
      { path: 'settings', name: 'ClientSettings', component: ClientSettingsView, meta: { title: '設定' } },
    ],
  },

  // ── Fallback ─────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Navigation Guard ───────────────────────────
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // 不需要認證的頁面（如 login）
  if (to.meta.requiresAuth === false) {
    // 已登入就直接跳 dashboard
    if (authStore.isAuthenticated && authStore.activeRole) {
      return authStore.getDashboardPath(authStore.activeRole)
    }
    return true
  }

  // 需要認證但未登入
  if (!authStore.isAuthenticated) {
    return '/login'
  }

  // 首次登入強制改密碼（契約 4.4）：鎖定只能停在改密碼頁
  if (authStore.mustChangePassword && to.name !== 'ChangePassword') {
    return '/change-password'
  }

  // 已登入但有多角色且未選擇角色（且不是正在前往選角色頁）
  if (!authStore.activeRole && to.name !== 'RoleSelect') {
    return '/select-role'
  }

  // 重整後 permissions 不持久化，首次進入受保護頁時補抓（唯一來源 /me）
  if (authStore.activeRole && authStore.permissions.length === 0) {
    await authStore.fetchMe()
  }

  // 檢查角色權限
  const requiredRoles = to.meta.roles
  if (requiredRoles && authStore.activeRole && !requiredRoles.includes(authStore.activeRole)) {
    return authStore.getDashboardPath(authStore.activeRole)
  }

  return true
})

// ── Dynamic Title ──────────────────────────────
router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `諮心管理 — ${title}` : '諮心管理 ConsulCore'
})

export default router
