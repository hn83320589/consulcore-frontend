import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import type { RoleCode } from '@/types'
import { needsPermissionLoad, resolveNavigation } from './navigation'

// ── Views ──────────────────────────────────────
import LoginView from '@/views/LoginView.vue'

// Layouts

// Admin Views

// Client Views

// ── Route Meta 型別擴展 ─────────────────────────
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    /** 不論登入狀態都可進入（例如 404），守衛直接放行 */
    public?: boolean
    roles?: RoleCode[]
    /** 進入此頁所需的權限碼（與後端權限碼一致）；側欄選單也從這裡讀 */
    permission?: string
    title?: string
  }
}

// ── Routes ─────────────────────────────────────
// 除登入頁外一律延遲載入：各頁面（與 FullCalendar、Chart.js 等大型套件）拆成獨立 chunk，進入時才下載
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
    component: () => import('@/views/RoleSelectView.vue'),
    meta: { requiresAuth: true, title: '選擇身份' },
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePasswordView.vue'),
    meta: { requiresAuth: true, title: '變更密碼' },
  },

  // ── Admin Routes ───────────────────��─────────
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['owner', 'therapist', 'admin'] },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { title: '儀表板' } },
      { path: 'staff', name: 'StaffManage', component: () => import('@/views/admin/StaffManageView.vue'), meta: { title: '人員管理', permission: 'staff.manage' } },
      { path: 'clients', name: 'ClientList', component: () => import('@/views/admin/ClientListView.vue'), meta: { title: '個案管理', permission: 'client.view' } },
      { path: 'clients/:id', name: 'ClientDetail', component: () => import('@/views/admin/ClientDetailView.vue'), meta: { title: '個案詳情', permission: 'client.view' } },
      { path: 'consents', name: 'ConsentManage', component: () => import('@/views/admin/ConsentManageView.vue'), meta: { title: '同意書管理', permission: 'consent.view' } },
      { path: 'rooms', name: 'RoomSetting', component: () => import('@/views/admin/RoomSettingView.vue'), meta: { title: '診間設定', permission: 'room.manage' } },
      { path: 'schedule', name: 'ScheduleManage', component: () => import('@/views/admin/ScheduleManageView.vue'), meta: { title: '排班管理', permission: 'schedule.view' } },
      { path: 'appointments', name: 'AppointmentManage', component: () => import('@/views/admin/AppointmentManageView.vue'), meta: { title: '預約管理', permission: 'appointment.view' } },
      { path: 'sessions/new', name: 'SessionNoteNew', component: () => import('@/views/admin/SessionNoteEditorView.vue'), meta: { title: '新增晤談紀錄', permission: 'session.view' } },
      { path: 'sessions/:id/edit', name: 'SessionNoteEdit', component: () => import('@/views/admin/SessionNoteEditorView.vue'), meta: { title: '編輯晤談紀錄', permission: 'session.view' } },
      { path: 'fee-settings', name: 'FeeSetting', component: () => import('@/views/admin/FeeSettingView.vue'), meta: { title: '費率設定', permission: 'billing.view' } },
      { path: 'billing', name: 'BillingManage', component: () => import('@/views/admin/BillingManageView.vue'), meta: { title: '收費管理', permission: 'billing.view' } },
      { path: 'notifications', name: 'NotificationTemplate', component: () => import('@/views/admin/NotificationTemplateView.vue'), meta: { title: '通知範本', permission: 'notification.manage' } },
      { path: 'performance', name: 'Performance', component: () => import('@/views/admin/PerformanceView.vue'), meta: { title: '考核管理', permission: 'performance.view' } },
      { path: 'audit-log', name: 'AuditLog', component: () => import('@/views/admin/AuditLogView.vue'), meta: { title: '稽核紀錄', permission: 'audit.view' } },
      { path: 'settings', name: 'OrgSetting', component: () => import('@/views/admin/OrgSettingView.vue'), meta: { title: '機構設定', permission: 'org.settings' } },
    ],
  },

  // ── Client Routes ────────────────────────────
  {
    path: '/client',
    component: () => import('@/components/layout/ClientLayout.vue'),
    meta: { requiresAuth: true, roles: ['client'] },
    children: [
      { path: 'dashboard', name: 'ClientDashboard', component: () => import('@/views/client/ClientDashboardView.vue'), meta: { title: '首頁' } },
      { path: 'consents', name: 'ClientConsent', component: () => import('@/views/client/ClientConsentView.vue'), meta: { title: '同意書' } },
      { path: 'appointments', name: 'ClientAppointments', component: () => import('@/views/client/ClientAppointmentView.vue'), meta: { title: '我的預約' } },
      { path: 'appointments/new', name: 'ClientNewAppointment', component: () => import('@/views/client/ClientNewAppointmentView.vue'), meta: { title: '預約諮商' } },
      { path: 'notifications', name: 'ClientNotifications', component: () => import('@/views/client/ClientNotificationView.vue'), meta: { title: '通知' } },
      { path: 'settings', name: 'ClientSettings', component: () => import('@/views/client/ClientSettingsView.vue'), meta: { title: '設定' } },
    ],
  },

  // ── Fallback ─────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true, title: '找不到頁面' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Navigation Guard ───────────────────────────
// 判斷規則在 navigation.ts（純函式、有表格測試）；這裡只負責補抓權限與提示
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (needsPermissionLoad(to, authStore, authStore.permissions.length > 0)) {
    // 失敗時 store 已清除登入狀態，必須明確回登入頁，不能繼續往下判斷
    if (!(await authStore.fetchMe())) return '/login'
  }

  const result = resolveNavigation(to, authStore)
  if (result === true) return true
  if (result.notice) useUiStore().showToast(result.notice, 'warning')
  return result.redirect
})

// ── Dynamic Title ──────────────────────────────
router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `諮心管理 — ${title}` : '諮心管理 ConsulCore'
})

export default router
