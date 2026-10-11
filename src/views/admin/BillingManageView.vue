<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useBillingStore } from '@/stores/billingStore'
import { useAuthStore } from '@/stores/authStore'
import { useClientStore } from '@/stores/clientStore'
import { useStaffStore } from '@/stores/staffStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import PaymentStatusBadge from '@/components/billing/PaymentStatusBadge.vue'
import PackageUsageBar from '@/components/billing/PackageUsageBar.vue'
import RevenueChart from '@/components/billing/RevenueChart.vue'
import { toLocalDateString } from '@/utils/date'
import { notifyError } from '@/utils/notifyError'
import type { BillingRecord, BillingSearchParams, PaymentMethod, PaymentStatus } from '@/types'

const billingStore = useBillingStore()
const authStore = useAuthStore()
const clientStore = useClientStore()
const staffStore = useStaffStore()
const uiStore = useUiStore()

const activeTab = ref<'records' | 'packages' | 'revenue'>('records')

// ══════════════════════════════════════════════
// Tab 1: 付款紀錄（GET /billing 完整清單 + 篩選 + CSV 匯出）
// ══════════════════════════════════════════════
const recordColumns: TableColumn[] = [
  { key: 'createdAt', label: '建立日期', width: '110px' },
  { key: 'clientName', label: '個案' },
  { key: 'paymentType', label: '類型', width: '90px' },
  { key: 'originalAmount', label: '原價', width: '90px' },
  { key: 'finalAmount', label: '應收', width: '90px' },
  { key: 'status', label: '狀態', width: '80px' },
  { key: 'actions', label: '', width: '120px' },
]
const recordTableData = computed(() => billingStore.records as unknown as Record<string, unknown>[])

// ── 篩選 ────────────────────────────────────
const filters = ref({
  startDate: '',
  endDate: '',
  clientProfileId: '' as string,
  therapistUserId: '' as string,
  status: '' as PaymentStatus | '',
})

const statusOptions = [
  { label: '待收款', value: 'pending' },
  { label: '已收款', value: 'paid' },
  { label: '已退費', value: 'refunded' },
  { label: '已免收', value: 'waived' },
]

const clientOptions = computed(() =>
  clientStore.clients.map((c) => ({ label: c.name, value: String(c.id) })),
)
const therapistOptions = computed(() =>
  staffStore.users
    .filter((u) => u.roles.includes('therapist'))
    .map((u) => ({ label: u.displayName, value: String(u.id) })),
)

function buildParams(): BillingSearchParams {
  return {
    startDate: filters.value.startDate || undefined,
    endDate: filters.value.endDate || undefined,
    clientProfileId: filters.value.clientProfileId ? Number(filters.value.clientProfileId) : undefined,
    therapistUserId: filters.value.therapistUserId ? Number(filters.value.therapistUserId) : undefined,
    status: filters.value.status || undefined,
  }
}

async function loadRecords() {
  await billingStore.fetchRecords(buildParams())
}

function resetFilters() {
  filters.value = { startDate: '', endDate: '', clientProfileId: '', therapistUserId: '', status: '' }
  loadRecords()
}

// ── CSV 匯出 ────────────────────────────────
async function handleExport() {
  try {
    const blob = await billingStore.exportRecords(buildParams())
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billing-${toLocalDateString(new Date()).replace(/-/g, '')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    uiStore.showToast('已匯出', 'success')
  } catch (e) { notifyError(e, '匯出失敗') }
}

function formatDate(val: unknown): string {
  return val ? new Date(String(val)).toLocaleDateString('zh-TW') : '-'
}
function paymentTypeLabel(val: unknown): string {
  return val === 'package_purchase' ? '套餐' : '單次'
}
function formatCurrency(val: unknown): string {
  return `$${Number(val).toLocaleString()}`
}

// Confirm Payment Modal
const showConfirmModal = ref(false)
const confirmTarget = ref<BillingRecord | null>(null)
const confirmForm = ref({ paymentMethod: '' as PaymentMethod | '' })

const paymentMethodOptions = [
  { label: '現金', value: 'cash' },
  { label: '轉帳', value: 'transfer' },
  { label: '信用卡', value: 'credit_card' },
  { label: 'LINE Pay', value: 'line_pay' },
  { label: '其他', value: 'other' },
]

function openConfirm(rec: BillingRecord) {
  confirmTarget.value = rec
  confirmForm.value = { paymentMethod: '' }
  showConfirmModal.value = true
}

async function handleConfirm() {
  if (!confirmTarget.value || !confirmForm.value.paymentMethod) return
  try {
    await billingStore.confirmPayment(confirmTarget.value.id, {
      paymentMethod: confirmForm.value.paymentMethod as PaymentMethod,
    })
    uiStore.showToast('付款已確認', 'success')
    showConfirmModal.value = false
    await loadRecords()
  } catch (e) { notifyError(e, '操作失敗') }
}

async function handleWaive(rec: BillingRecord) {
  try {
    await billingStore.waiveBilling(rec.id)
    uiStore.showToast('已免收', 'success')
    await loadRecords()
  } catch (e) { notifyError(e, '操作失敗') }
}

// ══════════════════════════════════════════════
// Tab 2: 套餐總覽（GET /billing/packages 完整清單）—— 直接讀 store.clientPackages
// ══════════════════════════════════════════════
// ── Tab 3: Revenue (Owner only) ──────────────
const isOwner = computed(() => authStore.activeRole === 'owner')

const now = new Date()
const reportYear = ref(now.getFullYear())
const reportMonth = ref(now.getMonth() + 1)

async function loadRevenue() {
  await Promise.all([
    billingStore.fetchMonthlyRevenue(reportYear.value, reportMonth.value),
    billingStore.fetchRevenueByTherapist(reportYear.value, reportMonth.value),
  ])
}

// ── Init ────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    billingStore.fetchRecords(),
    billingStore.fetchClientPackages(),
    clientStore.fetchClients(),
    staffStore.fetchUsers(),
  ])
  if (isOwner.value) {
    await loadRevenue()
  }
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-app-text mb-6">收費管理</h1>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-gray-200 mb-6">
      <button
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
        :class="activeTab === 'records' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'"
        @click="activeTab = 'records'"
      >付款紀錄</button>
      <button
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
        :class="activeTab === 'packages' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'"
        @click="activeTab = 'packages'"
      >套餐總覽</button>
      <button
        v-if="isOwner"
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
        :class="activeTab === 'revenue' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'"
        @click="activeTab = 'revenue'"
      >營收報表</button>
    </div>

    <!-- ═══ Records Tab（付款紀錄）═══ -->
    <div v-if="activeTab === 'records'">
      <!-- 篩選列 -->
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">起始日期</label>
          <input v-model="filters.startDate" type="date" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">結束日期</label>
          <input v-model="filters.endDate" type="date" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm" />
        </div>
        <AppSelect v-model="filters.clientProfileId" label="個案" :options="clientOptions" placeholder="全部" class="w-40" />
        <AppSelect v-model="filters.therapistUserId" label="心理師" :options="therapistOptions" placeholder="全部" class="w-40" />
        <AppSelect v-model="(filters.status as string)" label="狀態" :options="statusOptions" placeholder="全部" class="w-32" />
        <AppButton size="sm" @click="loadRecords">查詢</AppButton>
        <AppButton size="sm" variant="secondary" @click="resetFilters">重置</AppButton>
        <AppButton size="sm" variant="secondary" @click="handleExport">匯出 CSV</AppButton>
      </div>

      <AppTable :columns="recordColumns" :data="recordTableData" :loading="billingStore.loading">
        <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>
        <template #cell-paymentType="{ value }">{{ paymentTypeLabel(value) }}</template>
        <template #cell-originalAmount="{ value }">{{ formatCurrency(value) }}</template>
        <template #cell-finalAmount="{ value }">{{ formatCurrency(value) }}</template>
        <template #cell-status="{ row }">
          <PaymentStatusBadge :status="(row as unknown as BillingRecord).status" />
        </template>
        <template #cell-actions="{ row }">
          <div v-if="(row as unknown as BillingRecord).status === 'pending'" class="flex gap-1">
            <AppButton size="sm" variant="ghost" @click="openConfirm(row as unknown as BillingRecord)">收款</AppButton>
            <AppButton size="sm" variant="ghost" @click="handleWaive(row as unknown as BillingRecord)">免收</AppButton>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- ═══ Packages Tab（套餐總覽）═══ -->
    <div v-if="activeTab === 'packages'">
      <div v-if="billingStore.clientPackages.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
        目前沒有套餐紀錄
      </div>
      <div v-else class="bg-white border border-gray-200 rounded-app overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-4 py-2 text-left text-gray-600">個案</th>
              <th class="px-4 py-2 text-left text-gray-600">套餐</th>
              <th class="px-4 py-2 text-left text-gray-600 w-48">使用進度</th>
              <th class="px-4 py-2 text-left text-gray-600">狀態</th>
              <th class="px-4 py-2 text-left text-gray-600">到期日</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pkg in billingStore.clientPackages"
              :key="pkg.id"
              class="border-b border-gray-100"
              :class="pkg.sessionsRemaining <= 2 ? 'bg-yellow-50' : ''"
            >
              <td class="px-4 py-2">{{ pkg.clientName }}</td>
              <td class="px-4 py-2">{{ pkg.packageName }}</td>
              <td class="px-4 py-2">
                <PackageUsageBar :used="pkg.sessionsUsed" :remaining="pkg.sessionsRemaining" />
              </td>
              <td class="px-4 py-2">
                <span class="text-xs" :class="pkg.sessionsRemaining <= 2 ? 'text-yellow-600 font-medium' : 'text-gray-500'">
                  剩 {{ pkg.sessionsRemaining }} 次
                </span>
              </td>
              <td class="px-4 py-2 text-gray-500">{{ formatDate(pkg.expiresAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ Revenue Tab ═══ -->
    <div v-if="activeTab === 'revenue' && isOwner">
      <div class="flex items-end gap-3 mb-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">年</label>
          <input v-model.number="reportYear" type="number" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm w-24" @change="loadRevenue()" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">月</label>
          <input v-model.number="reportMonth" type="number" min="1" max="12" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm w-20" @change="loadRevenue()" />
        </div>
      </div>
      <RevenueChart
        v-if="billingStore.monthlyRevenue"
        :monthly="billingStore.monthlyRevenue"
        :by-therapist="billingStore.therapistRevenue"
      />
    </div>

    <!-- Confirm Payment Modal -->
    <AppModal :open="showConfirmModal" title="確認收款" @close="showConfirmModal = false">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          {{ confirmTarget?.clientName }} · 應收 {{ formatCurrency(confirmTarget?.finalAmount ?? 0) }}
        </p>
        <AppSelect v-model="(confirmForm.paymentMethod as string)" label="付款方式" :options="paymentMethodOptions" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showConfirmModal = false">取消</AppButton>
        <AppButton :disabled="!confirmForm.paymentMethod" @click="handleConfirm">確認</AppButton>
      </template>
    </AppModal>
  </div>
</template>
