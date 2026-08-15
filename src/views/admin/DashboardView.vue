<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import OwnerDashboard from '@/components/dashboard/OwnerDashboard.vue'
import TherapistDashboard from '@/components/dashboard/TherapistDashboard.vue'
import AdminDashboard from '@/components/dashboard/AdminDashboard.vue'

const authStore = useAuthStore()

// 依作用中角色動態渲染對應 Dashboard
const dashboardComponent = computed(() => {
  switch (authStore.activeRole) {
    case 'owner':
      return OwnerDashboard
    case 'therapist':
      return TherapistDashboard
    case 'admin':
      return AdminDashboard
    default:
      return null
  }
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-app-text mb-1">
      歡迎，{{ authStore.user?.displayName }}
    </h1>
    <p class="text-sm text-gray-500 mb-6">{{ authStore.user?.organizationName }}</p>

    <component :is="dashboardComponent" v-if="dashboardComponent" />
    <div v-else class="bg-white rounded-app border border-gray-200 p-6 text-sm text-gray-400">
      無可顯示的儀表板內容
    </div>
  </div>
</template>
