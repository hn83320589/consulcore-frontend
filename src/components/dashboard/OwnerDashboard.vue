<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useBillingStore } from '@/stores/billingStore'
import { useAppointmentStore } from '@/stores/appointmentStore'

const clientStore = useClientStore()
const billingStore = useBillingStore()
const appointmentStore = useAppointmentStore()

const now = new Date()

const monthRevenue = computed(() => billingStore.monthlyRevenue?.totalRevenue ?? 0)
const pendingTotal = computed(() =>
  billingStore.pendingRecords.reduce((sum, r) => sum + r.finalAmount, 0),
)
const clientCount = computed(() => clientStore.clients.length)
const renewalCount = computed(() => appointmentStore.pendingRenewals.length)

function money(v: number): string {
  return `$${v.toLocaleString()}`
}

onMounted(() => {
  Promise.allSettled([
    billingStore.fetchMonthlyRevenue(now.getFullYear(), now.getMonth() + 1),
    billingStore.fetchPending(),
    clientStore.fetchClients(),
    appointmentStore.fetchPendingRenewals(),
  ])
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-app border border-gray-200 p-5">
      <p class="text-sm text-gray-500">本月營收</p>
      <p class="text-2xl font-bold text-app-text mt-1">{{ money(monthRevenue) }}</p>
    </div>
    <div class="bg-white rounded-app border border-gray-200 p-5">
      <p class="text-sm text-gray-500">待收款金額</p>
      <p class="text-2xl font-bold text-app-text mt-1">{{ money(pendingTotal) }}</p>
    </div>
    <div class="bg-white rounded-app border border-gray-200 p-5">
      <p class="text-sm text-gray-500">個案總數</p>
      <p class="text-2xl font-bold text-app-text mt-1">{{ clientCount }}</p>
    </div>
    <div class="bg-white rounded-app border border-gray-200 p-5">
      <p class="text-sm text-gray-500">待續約常態預約</p>
      <p class="text-2xl font-bold text-app-text mt-1">{{ renewalCount }}</p>
    </div>
  </div>
</template>
