<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatDayWithWeekday } from '@/utils/format'
import type { AppointmentStatus } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()

const greetingByHour = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早安'
  if (h < 18) return '午安'
  return '晚安'
})

const statusLabel: Record<AppointmentStatus, string> = {
  scheduled: '已排定',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '未出席',
}

onMounted(() => {
  if (authStore.clientProfileId != null) {
    appointmentStore.fetchAppointments({ clientProfileId: authStore.clientProfileId })
  }
})
</script>

<template>
  <div>
    <!-- Greeting -->
    <h1 class="text-2xl font-bold text-app-text mb-1">
      {{ greetingByHour }}，{{ authStore.user?.displayName }}
    </h1>
    <p class="text-app-text/60 mb-8">
      歡迎回來，希望你今天一切順利。
    </p>

    <!-- Quick Actions -->
    <div class="flex gap-3 mb-8">
      <AppButton @click="router.push('/client/appointments/new')">
        預約諮商
      </AppButton>
      <AppButton variant="secondary" @click="router.push('/client/appointments')">
        查看預約
      </AppButton>
    </div>

    <!-- Upcoming Appointments -->
    <div class="mb-8">
      <h2 class="font-semibold text-app-text mb-4">近期預約</h2>
      <div v-if="appointmentStore.upcomingAppointments.length === 0" class="bg-white rounded-app border border-orange-100 p-6 text-center">
        <p class="text-app-text/40">目前沒有即將到來的預約</p>
        <AppButton class="mt-3" @click="router.push('/client/appointments/new')">
          立即預約
        </AppButton>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="apt in appointmentStore.upcomingAppointments.slice(0, 3)"
          :key="apt.id"
          class="bg-white rounded-app border border-orange-100 p-5 flex items-center justify-between"
        >
          <div>
            <p class="font-medium text-app-text">{{ formatDayWithWeekday(apt.date) }}</p>
            <p class="text-sm text-app-text/60 mt-0.5">
              {{ apt.startTime }} - {{ apt.endTime }} · {{ apt.therapistName }}
            </p>
            <p class="text-sm text-app-text/40 mt-0.5">{{ apt.roomName }}</p>
          </div>
          <AppBadge variant="info">{{ statusLabel[apt.status] }}</AppBadge>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-2 gap-3">
      <button
        class="bg-white rounded-app border border-orange-100 p-5 text-left hover:shadow-sm transition-shadow"
        @click="router.push('/client/consents')"
      >
        <p class="font-medium text-app-text">同意書</p>
        <p class="text-sm text-app-text/50 mt-1">查看已簽署的同意書</p>
      </button>
      <button
        class="bg-white rounded-app border border-orange-100 p-5 text-left hover:shadow-sm transition-shadow"
        @click="router.push('/client/settings')"
      >
        <p class="font-medium text-app-text">設定</p>
        <p class="text-sm text-app-text/50 mt-1">管理通知與個人偏好</p>
      </button>
    </div>
  </div>
</template>
