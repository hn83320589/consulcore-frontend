<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useBillingStore } from '@/stores/billingStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { toLocalDateString } from '@/utils/date'

const clientStore = useClientStore()
const billingStore = useBillingStore()
const appointmentStore = useAppointmentStore()

const today = toLocalDateString(new Date())

const todayCount = computed(
  () => appointmentStore.appointments.filter((a) => a.date === today).length,
)
const pendingPaymentCount = computed(() => billingStore.pendingRecords.length)
const clientCount = computed(() => clientStore.clients.length)

onMounted(() => {
  Promise.allSettled([
    appointmentStore.fetchAppointments({}),
    billingStore.fetchPending(),
    clientStore.fetchClients(),
  ])
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="bg-white rounded-app border border-gray-200 p-5">
      <p class="text-sm text-gray-500">今日預約</p>
      <p class="text-2xl font-bold text-app-text mt-1">{{ todayCount }}</p>
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
</template>
