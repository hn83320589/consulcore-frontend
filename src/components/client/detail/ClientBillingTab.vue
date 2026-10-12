<script setup lang="ts">
import { computed } from 'vue'
import { useBillingStore } from '@/stores/billingStore'
import PackageUsageBar from '@/components/billing/PackageUsageBar.vue'
import PaymentStatusBadge from '@/components/billing/PaymentStatusBadge.vue'
import { formatCurrency, formatDate } from '@/utils/format'

interface Props {
  clientId: number
}

const props = defineProps<Props>()
const billingStore = useBillingStore()

const clientBillingRecords = computed(() =>
  billingStore.records
    .filter((r) => r.clientProfileId === props.clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const clientPackages = computed(() =>
  billingStore.clientPackages.filter((p) => p.clientProfileId === props.clientId),
)

const pendingTotal = computed(() =>
  clientBillingRecords.value
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.finalAmount, 0),
)
</script>

<template>
  <div class="space-y-6">
    <!-- Summary -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-yellow-50 border border-yellow-100 rounded-app p-4">
        <p class="text-sm text-yellow-600">待收款</p>
        <p class="text-xl font-bold text-yellow-700">{{ formatCurrency(pendingTotal) }}</p>
      </div>
      <div class="bg-green-50 border border-green-100 rounded-app p-4">
        <p class="text-sm text-green-600">付款筆數</p>
        <p class="text-xl font-bold text-green-700">{{ clientBillingRecords.length }} 筆</p>
      </div>
    </div>

    <!-- 套餐使用 -->
    <div>
      <h4 class="font-semibold text-gray-800 mb-3">套餐使用</h4>
      <div v-if="clientPackages.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
        尚無套餐
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="pkg in clientPackages"
          :key="pkg.id"
          class="bg-white border border-gray-200 rounded-app p-4"
        >
          <PackageUsageBar
            :used="pkg.sessionsUsed"
            :remaining="pkg.sessionsRemaining"
            :label="pkg.packageName"
          />
          <p class="text-xs text-gray-400 mt-2">到期日：{{ formatDate(pkg.expiresAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Payment Records -->
    <div>
      <h4 class="font-semibold text-gray-800 mb-3">付款紀錄</h4>
      <div v-if="clientBillingRecords.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
        尚無付款紀錄
      </div>
      <div v-else class="bg-white border border-gray-200 rounded-app overflow-x-auto">
        <table class="w-full min-w-[36rem] text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-4 py-2 text-left text-gray-600">建立日期</th>
              <th class="px-4 py-2 text-right text-gray-600">原價</th>
              <th class="px-4 py-2 text-right text-gray-600">應收</th>
              <th class="px-4 py-2 text-left text-gray-600">狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in clientBillingRecords" :key="rec.id" class="border-b border-gray-100">
              <td class="px-4 py-2">{{ formatDate(rec.createdAt) }}</td>
              <td class="px-4 py-2 text-right">{{ formatCurrency(rec.originalAmount) }}</td>
              <td class="px-4 py-2 text-right">{{ formatCurrency(rec.finalAmount) }}</td>
              <td class="px-4 py-2"><PaymentStatusBadge :status="rec.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
