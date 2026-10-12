<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useBillingStore } from '@/stores/billingStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { toLocalDateString } from '@/utils/date'
import { todaysAppointments } from '@/utils/appointmentStatus'
import TodaySchedule from '@/components/dashboard/TodaySchedule.vue'

const clientStore = useClientStore()
const billingStore = useBillingStore()
const appointmentStore = useAppointmentStore()

const today = toLocalDateString(new Date())

// 原本連已取消的也算；與心理師儀表板一致，只算未取消的
const todayAppointments = computed(() => todaysAppointments(appointmentStore.appointments, today))
const pendingPaymentCount = computed(() => billingStore.pendingRecords.length)
const clientCount = computed(() => clientStore.clients.length)

onMounted(() => {
  Promise.allSettled([
    appointmentStore.fetchCalendar(today, today),
    billingStore.fetchPending(),
    clientStore.fetchClients(),
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
        <p class="text-sm text-gray-500">待收款筆數</p>
        <p class="text-2xl font-bold text-app-text mt-1">{{ pendingPaymentCount }}</p>
      </div>
      <div class="bg-white rounded-app border border-gray-200 p-5">
        <p class="text-sm text-gray-500">個案總數</p>
        <p class="text-2xl font-bold text-app-text mt-1">{{ clientCount }}</p>
      </div>
    </div>

    <TodaySchedule :appointments="todayAppointments" show-therapist />
  </div>
</template>
