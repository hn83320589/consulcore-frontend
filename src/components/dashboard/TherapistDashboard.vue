<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { toLocalDateString } from '@/utils/date'
import { todaysAppointments } from '@/utils/appointmentStatus'
import TodaySchedule from '@/components/dashboard/TodaySchedule.vue'

const clientStore = useClientStore()
const appointmentStore = useAppointmentStore()

const today = toLocalDateString(new Date())

// therapist 身份下後端自動只回自己的個案 / 預約；今天已完成的晤談也算今日預約
const todayAppointments = computed(() => todaysAppointments(appointmentStore.appointments, today))
const myClientCount = computed(() => clientStore.clients.length)
const renewalCount = computed(() => appointmentStore.pendingRenewals.length)

onMounted(() => {
  Promise.allSettled([
    appointmentStore.fetchCalendar(today, today),
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

    <TodaySchedule :appointments="todayAppointments" />
  </div>
</template>
