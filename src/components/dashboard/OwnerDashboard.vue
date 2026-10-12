<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useClientStore } from '@/stores/clientStore'
import { useBillingStore } from '@/stores/billingStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { toLocalDateString } from '@/utils/date'
import { formatCurrency, formatDate } from '@/utils/format'
import { todaysAppointments } from '@/utils/appointmentStatus'
import TodaySchedule from '@/components/dashboard/TodaySchedule.vue'

const clientStore = useClientStore()
const billingStore = useBillingStore()
const appointmentStore = useAppointmentStore()

const now = new Date()
const today = toLocalDateString(now)

const monthRevenue = computed(() => billingStore.monthlyRevenue?.totalRevenue ?? 0)
const pendingTotal = computed(() =>
  billingStore.pendingRecords.reduce((sum, r) => sum + r.finalAmount, 0),
)
const clientCount = computed(() => clientStore.clients.length)
const renewalCount = computed(() => appointmentStore.pendingRenewals.length)
const todayAppointments = computed(() => todaysAppointments(appointmentStore.appointments, today))
// 儀表板只列最早的幾筆，完整清單在收費管理
const pendingPreview = computed(() =>
  [...billingStore.pendingRecords].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(0, 5),
)

onMounted(() => {
  Promise.allSettled([
    billingStore.fetchMonthlyRevenue(now.getFullYear(), now.getMonth() + 1),
    billingStore.fetchPending(),
    clientStore.fetchClients(),
    appointmentStore.fetchPendingRenewals(),
    appointmentStore.fetchCalendar(today, today),
  ])
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-app border border-gray-200 p-5">
        <p class="text-sm text-gray-500">本月營收</p>
        <p class="text-2xl font-bold text-app-text mt-1">{{ formatCurrency(monthRevenue) }}</p>
      </div>
      <div class="bg-white rounded-app border border-gray-200 p-5">
        <p class="text-sm text-gray-500">待收款金額</p>
        <p class="text-2xl font-bold text-app-text mt-1">{{ formatCurrency(pendingTotal) }}</p>
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TodaySchedule class="lg:col-span-2" :appointments="todayAppointments" show-therapist />

      <div class="bg-white rounded-app border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-700">待收款</h2>
          <RouterLink to="/admin/billing" class="text-xs text-primary hover:underline">查看全部</RouterLink>
        </div>
        <div v-if="pendingPreview.length === 0" class="text-sm text-gray-400 py-4 text-center">
          目前沒有待收款
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="r in pendingPreview" :key="r.id" class="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span class="text-gray-700">{{ r.clientName }}</span>
            <span class="text-gray-400 text-xs">{{ formatDate(r.createdAt) }}</span>
            <span class="font-medium text-app-text">{{ formatCurrency(r.finalAmount) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
