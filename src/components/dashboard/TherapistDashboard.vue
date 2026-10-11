<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { toLocalDateString } from '@/utils/date'

const clientStore = useClientStore()
const appointmentStore = useAppointmentStore()

const today = toLocalDateString(new Date())

// therapist 身份下後端自動只回自己的個案 / 預約
const todayAppointments = computed(() =>
  appointmentStore.appointments
    .filter((a) => a.date === today && a.status === 'scheduled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime)),
)
const myClientCount = computed(() => clientStore.clients.length)
const renewalCount = computed(() => appointmentStore.pendingRenewals.length)

onMounted(() => {
  Promise.allSettled([
    appointmentStore.fetchAppointments({}),
    clientStore.fetchClients(),
    appointmentStore.fetchPendingRenewals(),
  ])
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-app border border-gray-200 p-5">
        <p class="text-sm text-gray-500">今日預約</p>
        <p class="text-2xl font-bold text-app-text mt-1">{{ todayAppointments.length }}</p>
      </div>
      <div class="bg-white rounded-app border border-gray-200 p-5">
        <p class="text-sm text-gray-500">我的個案</p>
        <p class="text-2xl font-bold text-app-text mt-1">{{ myClientCount }}</p>
      </div>
      <div class="bg-white rounded-app border border-gray-200 p-5">
        <p class="text-sm text-gray-500">待續約提醒</p>
        <p class="text-2xl font-bold text-app-text mt-1">{{ renewalCount }}</p>
      </div>
    </div>

    <div class="bg-white rounded-app border border-gray-200 p-5">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">今日排程</h2>
      <div v-if="todayAppointments.length === 0" class="text-sm text-gray-400 py-4 text-center">
        今日尚無預約
      </div>
      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="a in todayAppointments"
          :key="a.id"
          class="flex items-center justify-between py-2.5 text-sm"
        >
          <span class="font-medium text-app-text">{{ a.startTime }} - {{ a.endTime }}</span>
          <span class="text-gray-600">{{ a.clientName }}</span>
          <span class="text-gray-400">{{ a.roomName ?? '—' }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
