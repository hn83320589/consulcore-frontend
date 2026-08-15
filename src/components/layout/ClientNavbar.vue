<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

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
  <header class="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-40">
    <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <span class="font-bold text-primary text-lg">ConsulCore</span>

      <!-- Nav Links -->
      <nav class="flex items-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="px-3 py-2 text-sm rounded-app transition-colors"
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
        class="text-sm text-app-text/60 hover:text-app-text"
        @click="authStore.logout()"
      >
        登出
      </button>
    </div>
  </header>
</template>
