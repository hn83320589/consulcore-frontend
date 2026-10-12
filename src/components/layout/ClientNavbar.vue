<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthActions } from '@/composables/useAuthActions'

const router = useRouter()
const route = useRoute()
const authActions = useAuthActions()

interface NavItem {
  label: string
  path: string
}

const navItems: NavItem[] = [
  { label: '首頁', path: '/client/dashboard' },
  { label: '我的預約', path: '/client/appointments' },
  { label: '同意書', path: '/client/consents' },
  { label: '通知', path: '/client/notifications' },
  { label: '設定', path: '/client/settings' },
]

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="bg-white/80 backdrop-blur-xs border-b border-orange-100 sticky top-0 z-40">
    <!-- 手機：第一列 Logo + 登出，第二列導覽可左右滑動；sm 以上合併為單列 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-4 sm:h-16">
      <!-- Logo -->
      <span class="font-bold text-primary text-lg h-12 sm:h-auto flex items-center">ConsulCore</span>

      <!-- Nav Links -->
      <nav class="order-last sm:order-none w-full sm:w-auto flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="shrink-0 whitespace-nowrap px-3 py-2 text-sm rounded-app transition-colors"
          :class="isActive(item.path)
            ? 'text-primary font-medium bg-orange-50'
            : 'text-app-text/60 hover:text-app-text'"
          @click="router.push(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>

      <!-- User -->
      <button
        class="whitespace-nowrap text-sm text-app-text/60 hover:text-app-text"
        @click="authActions.logout()"
      >
        登出
      </button>
    </div>
  </header>
</template>
