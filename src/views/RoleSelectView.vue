<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import type { RoleCode } from '@/types'

const authStore = useAuthStore()

const roleInfo: Record<RoleCode, { label: string; description: string; icon: string }> = {
  owner: { label: '機構負責人', description: '管理整個機構的營運', icon: '🏢' },
  therapist: { label: '心理師', description: '管理個案與晤談紀錄', icon: '🧠' },
  admin: { label: '行政人員', description: '處理預約與行政事務', icon: '📋' },
  client: { label: '個案', description: '預約與查看個人資訊', icon: '👤' },
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-app-bg">
    <div class="w-full max-w-lg">
      <h1 class="text-2xl font-bold text-center text-primary mb-2">選擇身份</h1>
      <p class="text-center text-gray-500 text-sm mb-8">您擁有多個角色，請選擇要使用的身份</p>

      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="role in authStore.roles"
          :key="role"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:border-primary hover:shadow-md transition-all"
          @click="authStore.switchRole(role as RoleCode)"
        >
          <span class="text-3xl block mb-3">{{ roleInfo[role as RoleCode]?.icon }}</span>
          <h3 class="font-semibold text-gray-800">{{ roleInfo[role as RoleCode]?.label }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ roleInfo[role as RoleCode]?.description }}</p>
          <p v-if="authStore.user?.organizationName" class="text-xs text-primary mt-2">
            {{ authStore.user.organizationName }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
