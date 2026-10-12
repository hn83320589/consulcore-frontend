<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

interface Props {
  /** 手機覆蓋式選單：一律顯示完整文字，底部按鈕改為關閉選單 */
  mobile?: boolean
}
const props = withDefaults(defineProps<Props>(), { mobile: false })

interface MenuItem {
  label: string
  icon: string
  path: string
}

// 所需權限由路由的 meta.permission 決定（router/index.ts），側欄不另外維護
const allMenuItems: MenuItem[] = [
  { label: '儀表板', icon: '📊', path: '/admin/dashboard' },
  { label: '預約管理', icon: '📅', path: '/admin/appointments' },
  { label: '排班管理', icon: '🗓️', path: '/admin/schedule' },
  { label: '個案管理', icon: '👤', path: '/admin/clients' },
  { label: '晤談紀錄', icon: '📝', path: '/admin/sessions/new' },
  { label: '收費管理', icon: '💰', path: '/admin/billing' },
  { label: '同意書', icon: '📋', path: '/admin/consents' },
  { label: '考核管理', icon: '📈', path: '/admin/performance' },
  { label: '諮商室', icon: '🏠', path: '/admin/rooms' },
  { label: '人員管理', icon: '👥', path: '/admin/staff' },
  { label: '費率設定', icon: '⚙️', path: '/admin/fee-settings' },
  { label: '通知範本', icon: '🔔', path: '/admin/notifications' },
  { label: '稽核紀錄', icon: '📜', path: '/admin/audit-log' },
  { label: '機構設定', icon: '🏢', path: '/admin/settings' },
]

const visibleMenuItems = computed(() =>
  allMenuItems.filter((item) => {
    const permission = router.resolve(item.path).meta.permission
    return !permission || authStore.hasPermission(permission)
  }),
)

const collapsed = computed(() => !props.mobile && uiStore.sidebarCollapsed)

function navigate(path: string) {
  router.push(path)
}

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <aside
    class="h-screen bg-white border-r border-gray-200 transition-all duration-200 flex flex-col shrink-0"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Logo -->
    <div class="h-14 flex items-center px-4 border-b border-gray-200">
      <span v-if="!collapsed" class="font-bold text-primary text-lg">ConsulCore</span>
      <span v-else class="font-bold text-primary text-lg">CC</span>
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
        <span class="text-base shrink-0">{{ item.icon }}</span>
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Collapse Toggle（手機：關閉選單） -->
    <button
      class="h-12 flex items-center justify-center border-t border-gray-200 text-gray-400 hover:text-gray-600"
      :aria-label="mobile ? '關閉選單' : collapsed ? '展開側欄' : '收合側欄'"
      @click="mobile ? uiStore.setMobileNav(false) : uiStore.toggleSidebar()"
    >
      {{ mobile ? '✕' : collapsed ? '→' : '←' }}
    </button>
  </aside>
</template>
