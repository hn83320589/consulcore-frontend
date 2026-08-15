<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

interface MenuItem {
  label: string
  icon: string
  path: string
  permission?: string
}

// permission 碼須與契約第 5 節的 32 個權限碼一字不差（單數、正確命名空間）
const allMenuItems: MenuItem[] = [
  { label: '儀表板', icon: '📊', path: '/admin/dashboard' },
  { label: '預約管理', icon: '📅', path: '/admin/appointments', permission: 'appointment.view' },
  { label: '排班管理', icon: '🗓️', path: '/admin/schedule', permission: 'schedule.view' },
  { label: '個案管理', icon: '👤', path: '/admin/clients', permission: 'client.view' },
  { label: '晤談紀錄', icon: '📝', path: '/admin/sessions/new', permission: 'session.view' },
  { label: '收費管理', icon: '💰', path: '/admin/billing', permission: 'billing.view' },
  { label: '同意書', icon: '📋', path: '/admin/consents', permission: 'consent.view' },
  { label: '考核管理', icon: '📈', path: '/admin/performance', permission: 'performance.view' },
  { label: '諮商室', icon: '🏠', path: '/admin/rooms', permission: 'room.manage' },
  { label: '人員管理', icon: '👥', path: '/admin/staff', permission: 'staff.manage' },
  { label: '費率設定', icon: '⚙️', path: '/admin/fee-settings', permission: 'billing.view' },
  { label: '通知範本', icon: '🔔', path: '/admin/notifications', permission: 'notification.manage' },
  { label: '稽核紀錄', icon: '📜', path: '/admin/audit-log', permission: 'audit.view' },
  { label: '機構設定', icon: '🏢', path: '/admin/settings', permission: 'org.settings' },
]

const visibleMenuItems = computed(() =>
  allMenuItems.filter((item) => !item.permission || authStore.hasPermission(item.permission)),
)

const collapsed = computed(() => uiStore.sidebarCollapsed)

function navigate(path: string) {
  router.push(path)
}

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <aside
    class="h-screen bg-white border-r border-gray-200 transition-all duration-200 flex flex-col flex-shrink-0"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Logo -->
    <div class="h-14 flex items-center px-4 border-b border-gray-200">
      <span class="font-bold text-primary text-lg" v-if="!collapsed">ConsulCore</span>
      <span class="font-bold text-primary text-lg" v-else>CC</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 overflow-y-auto py-2">
      <button
        v-for="item in visibleMenuItems"
        :key="item.path"
        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
        :class="isActive(item.path) ? 'text-primary bg-blue-50 font-medium' : 'text-gray-600'"
        :title="collapsed ? item.label : undefined"
        @click="navigate(item.path)"
      >
        <span class="text-base flex-shrink-0">{{ item.icon }}</span>
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Collapse Toggle -->
    <button
      class="h-12 flex items-center justify-center border-t border-gray-200 text-gray-400 hover:text-gray-600"
      @click="uiStore.toggleSidebar()"
    >
      {{ collapsed ? '→' : '←' }}
    </button>
  </aside>
</template>
