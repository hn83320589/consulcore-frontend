<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { dashboardPathFor } from '@/router/navigation'

const authStore = useAuthStore()
const home = computed(() =>
  authStore.isAuthenticated && authStore.activeRole ? dashboardPathFor(authStore.activeRole) : '/login',
)
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-4 bg-app-bg text-app-text p-6">
    <p class="text-5xl font-bold text-primary">404</p>
    <h1 class="text-lg font-semibold">找不到這個頁面</h1>
    <p class="text-sm opacity-70">網址可能打錯了，或頁面已經移除。</p>
    <router-link :to="home" class="text-sm text-primary underline">
      {{ home === '/login' ? '前往登入' : '回到首頁' }}
    </router-link>
  </main>
</template>
