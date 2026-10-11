<script setup lang="ts">
import { useAuthActions } from '@/composables/useAuthActions'
import { useUiStore } from '@/stores/uiStore'
import AdminSidebar from './AdminSidebar.vue'
import RoleSwitcher from './RoleSwitcher.vue'
import NotificationBell from './NotificationBell.vue'

const authActions = useAuthActions()
const uiStore = useUiStore()
</script>

<template>
  <div class="flex h-screen bg-app-bg">
    <!-- Sidebar: desktop fixed, mobile overlay -->
    <div class="hidden md:block">
      <AdminSidebar />
    </div>

    <!-- Mobile sidebar overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="!uiStore.sidebarCollapsed"
        class="fixed inset-0 z-40 md:hidden"
      >
        <div class="absolute inset-0 bg-black/30" @click="uiStore.toggleSidebar()" />
        <div class="relative w-60">
          <AdminSidebar />
        </div>
      </div>
    </Transition>

    <!-- Main Area -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Top Bar -->
      <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <!-- Left: mobile hamburger + breadcrumb -->
        <div class="flex items-center gap-3">
          <button
            class="md:hidden text-gray-500 hover:text-gray-700 p-1"
            @click="uiStore.toggleSidebar()"
          >
            ☰
          </button>
          <div class="text-sm text-gray-500 hidden sm:block">
            <!-- 未來放麵包屑 -->
          </div>
        </div>

        <!-- Right actions -->
        <div class="flex items-center gap-2 md:gap-3">
          <NotificationBell />
          <RoleSwitcher />
          <button
            class="text-sm text-gray-500 hover:text-gray-700 hidden sm:inline"
            @click="authActions.logout()"
          >
            登出
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
