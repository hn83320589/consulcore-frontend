<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePerformanceStore } from '@/stores/performanceStore'
import { useStaffStore } from '@/stores/staffStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import MetricsCard from '@/components/performance/MetricsCard.vue'
import MetricsTrend from '@/components/performance/MetricsTrend.vue'
import ReviewForm from '@/components/performance/ReviewForm.vue'
import { toLocalDateString } from '@/utils/date'
import { notifyError } from '@/utils/notifyError'
import type {
  PerformanceReview, ReviewVisibility, TherapistMetrics,
  ViolationRecord, ViolationSeverity, CreatePerformanceReviewRequest,
  CreateViolationRecordRequest, MetricsSearchParams, MetricsTrendParams,
} from '@/types'

const authStore = useAuthStore()
const perfStore = usePerformanceStore()
const staffStore = useStaffStore()
const uiStore = useUiStore()

const activeTab = ref<'metrics' | 'reviews' | 'violations'>('metrics')
const isOwner = computed(() => authStore.activeRole === 'owner')
const periodFilter = ref('quarterly')

// ══════════ Tab 1: Metrics ══════════
// period 選單換算成 startDate/endDate（後端 metrics 端點必填），以今日為 endDate 回推。
function computeRange(period: string): MetricsSearchParams {
  const end = new Date()
  const start = new Date()
  if (period === 'monthly') start.setMonth(start.getMonth() - 1)
  else if (period === 'yearly') start.setFullYear(start.getFullYear() - 1)
  else start.setMonth(start.getMonth() - 3) // quarterly（預設）
  return { startDate: toLocalDateString(start), endDate: toLocalDateString(end) }
}

async function loadMetrics() {
  const params = computeRange(periodFilter.value)
  if (isOwner.value) {
    await perfStore.fetchComparison(params)
  } else if (authStore.user?.id != null) {
    await perfStore.fetchMetrics(authStore.user.id, params)
  }
}

// 8 項量化指標顯示定義
interface MetricDef {
  key: 'appointmentCompletionRate' | 'noShowRate' | 'avgNoteDelayHours' | 'noteLockRate'
    | 'clientRetentionRate' | 'monthlySessionCount' | 'monthlySessionHours' | 'paymentCompletionRate'
  label: string
  unit: string
}
const metricDefs: MetricDef[] = [
  { key: 'appointmentCompletionRate', label: '預約完成率', unit: '%' },
  { key: 'noShowRate', label: '未到率', unit: '%' },
  { key: 'avgNoteDelayHours', label: '紀錄及時性', unit: '小時' },
  { key: 'noteLockRate', label: '紀錄鎖定率', unit: '%' },
  { key: 'clientRetentionRate', label: '個案留存率', unit: '%' },
  { key: 'monthlySessionCount', label: '月諮商次數', unit: '次' },
  { key: 'monthlySessionHours', label: '月諮商時數', unit: '小時' },
  { key: 'paymentCompletionRate', label: '收費完成率', unit: '%' },
]
// 後端 rate 欄位已是百分比數值（0–100），此處僅做小數位收斂顯示。
function fmtMetric(v: number): number {
  return Number.isInteger(v) ? v : Math.round(v * 10) / 10
}

// ── 趨勢圖 ──
// 指標選單（8 個 metric 鍵，附中文 label，沿用 metricDefs）
const selectedMetric = ref<string>('appointmentCompletionRate')
const selectedMetricLabel = computed(
  () => metricDefs.find((d) => d.key === selectedMetric.value)?.label ?? '趨勢',
)
const metricOptions = metricDefs.map((d) => ({ label: d.label, value: d.key }))

// owner 可選一位心理師看趨勢；therapist 看自己。（AppSelect value 為字串）
const selectedTherapistId = ref<string>('')
const therapistOptions = computed(() =>
  staffStore.users
    .filter((u) => u.roles.includes('therapist'))
    .map((u) => ({ label: u.displayName, value: String(u.id) })),
)
// 趨勢對象的 therapistUserId：owner 用下拉選擇，否則用自己的 id。
const trendTherapistId = computed<number | null>(() =>
  isOwner.value
    ? (selectedTherapistId.value ? Number(selectedTherapistId.value) : null)
    : (authStore.user?.id ?? null),
)

async function loadTrend() {
  const therapistUserId = trendTherapistId.value
  if (therapistUserId == null) {
    perfStore.trend = null
    return
  }
  const range = computeRange(periodFilter.value)
  const params: MetricsTrendParams = {
    metric: selectedMetric.value,
    startDate: range.startDate,
    endDate: range.endDate,
    interval: 'month',
  }
  await perfStore.fetchMetricsTrend(therapistUserId, params)
}

// period 變動時同時刷新指標與趨勢
async function loadMetricsAndTrend() {
  await loadMetrics()
  await loadTrend()
}

// ══════════ Tab 2: Reviews ══════════
const reviewColumns: TableColumn[] = [
  { key: 'therapistName', label: '心理師' },
  { key: 'period', label: '期間', width: '140px' },
  { key: 'overallScore', label: '總分', width: '70px' },
  { key: 'visibility', label: '可見性', width: '90px' },
  { key: 'actions', label: '', width: '160px' },
]
const reviewTableData = computed(() => perfStore.reviews as unknown as Record<string, unknown>[])

const showReviewModal = ref(false)
const reviewSaving = ref(false)

async function handleCreateReview(payload: CreatePerformanceReviewRequest) {
  reviewSaving.value = true
  try {
    await perfStore.createReview(payload)
    uiStore.showToast('考核已提交', 'success')
    showReviewModal.value = false
  } catch (e) { notifyError(e, '提交失敗') }
  finally { reviewSaving.value = false }
}

async function handleDeleteReview(review: PerformanceReview) {
  if (!confirm(`確定刪除 ${review.therapistName} 的考核紀錄？`)) return
  try {
    await perfStore.deleteReview(review.id)
    uiStore.showToast('已刪除', 'success')
  } catch (e) { notifyError(e, '刪除失敗') }
}

// 可見性設定
const showVisibilityModal = ref(false)
const visibilityTarget = ref<PerformanceReview | null>(null)
const visForm = ref({ visibility: 'hidden' as ReviewVisibility, visibleFrom: '', visibleUntil: '' })

function openVisibility(review: PerformanceReview) {
  visibilityTarget.value = review
  visForm.value = {
    visibility: review.visibility,
    visibleFrom: review.visibleFrom ?? '',
    visibleUntil: review.visibleUntil ?? '',
  }
  showVisibilityModal.value = true
}

async function handleUpdateVisibility() {
  if (!visibilityTarget.value) return
  try {
    await perfStore.setVisibility(visibilityTarget.value.id, {
      visibility: visForm.value.visibility,
      visibleFrom: visForm.value.visibleFrom || null,
      visibleUntil: visForm.value.visibleUntil || null,
    })
    uiStore.showToast('已更新可見性', 'success')
    showVisibilityModal.value = false
  } catch (e) { notifyError(e, '更新失敗') }
}

const visibilityLabels: Record<ReviewVisibility, string> = { hidden: '隱藏', visible: '可見' }
const visibilityOptions = [
  { label: '隱藏', value: 'hidden' },
  { label: '可見', value: 'visible' },
]

// ══════════ Tab 3: Violations ══════════
const violationColumns: TableColumn[] = [
  { key: 'therapistName', label: '心理師' },
  { key: 'severity', label: '嚴重度', width: '90px' },
  { key: 'description', label: '描述' },
  { key: 'status', label: '狀態', width: '80px' },
  { key: 'actions', label: '', width: '160px' },
]
const violationTableData = computed(() => perfStore.violations as unknown as Record<string, unknown>[])

const severityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '嚴重', value: 'critical' },
]
const severityLabels: Record<ViolationSeverity, string> = { low: '低', medium: '中', high: '高', critical: '嚴重' }
function severityVariant(s: ViolationSeverity): 'default' | 'warning' | 'danger' {
  if (s === 'critical' || s === 'high') return 'danger'
  if (s === 'medium') return 'warning'
  return 'default'
}

const showViolationModal = ref(false)
const violationForm = ref({ therapistUserId: '', incidentDate: '', severity: 'low' as ViolationSeverity, description: '', actionTaken: '' })
const violationSaving = ref(false)

function openViolationModal() {
  violationForm.value = { therapistUserId: '', incidentDate: '', severity: 'low', description: '', actionTaken: '' }
  showViolationModal.value = true
}

async function handleCreateViolation() {
  const therapistUserId = Number(violationForm.value.therapistUserId)
  if (!Number.isFinite(therapistUserId) || therapistUserId <= 0) {
    uiStore.showToast('請輸入有效的心理師 ID', 'error')
    return
  }
  violationSaving.value = true
  try {
    const payload: CreateViolationRecordRequest = {
      therapistUserId,
      incidentDate: violationForm.value.incidentDate,
      severity: violationForm.value.severity,
      description: violationForm.value.description,
      actionTaken: violationForm.value.actionTaken || null,
    }
    await perfStore.createViolation(payload)
    uiStore.showToast('違規已記錄', 'success')
    showViolationModal.value = false
  } catch (e) { notifyError(e, '記錄失敗') }
  finally { violationSaving.value = false }
}

// 處理（resolve）：POST /resolve body { actionTaken }
const showResolveModal = ref(false)
const resolveTarget = ref<ViolationRecord | null>(null)
const resolveActionTaken = ref('')

function openResolve(v: ViolationRecord) {
  resolveTarget.value = v
  resolveActionTaken.value = ''
  showResolveModal.value = true
}

async function handleResolve() {
  if (!resolveTarget.value) return
  if (resolveActionTaken.value.trim() === '') {
    uiStore.showToast('請填寫處置說明', 'error')
    return
  }
  try {
    await perfStore.resolveViolation(resolveTarget.value.id, { actionTaken: resolveActionTaken.value })
    uiStore.showToast('已處理', 'success')
    showResolveModal.value = false
  } catch (e) { notifyError(e, '操作失敗') }
}

// 駁回（dismiss）：POST /dismiss 無 body
async function handleDismiss(v: ViolationRecord) {
  if (!confirm(`確定駁回 ${v.therapistName} 的違規紀錄？`)) return
  try {
    await perfStore.dismissViolation(v.id)
    uiStore.showToast('已駁回', 'success')
  } catch (e) { notifyError(e, '操作失敗') }
}

const violationStatusLabels: Record<string, string> = { open: '待處理', resolved: '已解決', dismissed: '已駁回' }

// ── Init ──
onMounted(async () => {
  await loadMetrics()
  if (isOwner.value) {
    // owner 趨勢需選擇心理師，載入人員清單並預設第一位
    await staffStore.fetchUsers()
    selectedTherapistId.value = therapistOptions.value[0]?.value ?? ''
    await Promise.all([perfStore.fetchReviews(), perfStore.fetchViolations()])
  } else if (authStore.user?.id != null) {
    await perfStore.fetchReviewsByTherapist(authStore.user.id)
  }
  await loadTrend()
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-app-text mb-6">考核管理</h1>

    <div class="flex gap-1 border-b border-gray-200 mb-6">
      <button class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
        :class="activeTab === 'metrics' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'"
        @click="activeTab = 'metrics'">績效總覽</button>
      <button class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
        :class="activeTab === 'reviews' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'"
        @click="activeTab = 'reviews'">定期考核</button>
      <button v-if="isOwner" class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
        :class="activeTab === 'violations' ? 'text-primary border-primary' : 'text-gray-500 border-transparent'"
        @click="activeTab = 'violations'">違規紀錄</button>
    </div>

    <!-- ═══ Metrics ═══ -->
    <div v-if="activeTab === 'metrics'">
      <div class="flex items-center gap-3 mb-4">
        <AppSelect v-model="periodFilter"
          :options="[{label:'近一月',value:'monthly'},{label:'近一季',value:'quarterly'},{label:'近一年',value:'yearly'}]"
          @update:model-value="loadMetricsAndTrend()" />
      </div>

      <div v-if="perfStore.metrics.length === 0" class="text-sm text-gray-400 py-8 text-center">
        目前沒有量化指標資料
      </div>

      <div v-for="(m, idx) in (perfStore.metrics as TherapistMetrics[])" :key="m.therapistUserId ?? idx" class="mb-6">
        <h3 class="text-sm font-semibold text-app-text mb-2">{{ m.therapistName }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard v-for="def in metricDefs" :key="def.key"
            :label="def.label" :value="fmtMetric(m[def.key])" :unit="def.unit" />
        </div>
      </div>

      <!-- ═══ 指標趨勢圖 ═══ -->
      <div class="mt-8">
        <h3 class="text-sm font-semibold text-app-text mb-3">指標趨勢</h3>
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <AppSelect v-model="selectedMetric"
            :options="metricOptions"
            @update:model-value="loadTrend()" />
          <AppSelect v-if="isOwner" v-model="selectedTherapistId"
            :options="therapistOptions"
            placeholder="選擇心理師"
            @update:model-value="loadTrend()" />
        </div>
        <MetricsTrend :trend="perfStore.trend" :label="selectedMetricLabel" />
      </div>
    </div>

    <!-- ═══ Reviews ═══ -->
    <div v-if="activeTab === 'reviews'">
      <div v-if="isOwner" class="flex justify-end mb-4">
        <AppButton @click="showReviewModal = true">新增考核</AppButton>
      </div>
      <AppTable :columns="reviewColumns" :data="reviewTableData">
        <template #cell-overallScore="{ row }">
          <span class="font-bold">{{ (row as unknown as PerformanceReview).overallScore.toFixed(1) }}</span>
        </template>
        <template #cell-visibility="{ row }">
          <AppBadge :variant="(row as unknown as PerformanceReview).visibility === 'visible' ? 'success' : 'default'">
            {{ visibilityLabels[(row as unknown as PerformanceReview).visibility] }}
          </AppBadge>
        </template>
        <template #cell-actions="{ row }">
          <div v-if="isOwner" class="flex gap-1">
            <AppButton size="sm" variant="ghost" @click="openVisibility(row as unknown as PerformanceReview)">可見性</AppButton>
            <AppButton size="sm" variant="ghost" @click="handleDeleteReview(row as unknown as PerformanceReview)">刪除</AppButton>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- ═══ Violations ═══ -->
    <div v-if="activeTab === 'violations' && isOwner">
      <div class="flex justify-end mb-4">
        <AppButton @click="openViolationModal">新增違規</AppButton>
      </div>
      <AppTable :columns="violationColumns" :data="violationTableData">
        <template #cell-severity="{ row }">
          <AppBadge :variant="severityVariant((row as unknown as ViolationRecord).severity)">
            {{ severityLabels[(row as unknown as ViolationRecord).severity] }}
          </AppBadge>
        </template>
        <template #cell-status="{ row }">
          <AppBadge :variant="(row as unknown as ViolationRecord).status === 'open' ? 'warning' : (row as unknown as ViolationRecord).status === 'resolved' ? 'success' : 'default'">
            {{ violationStatusLabels[(row as unknown as ViolationRecord).status] }}
          </AppBadge>
        </template>
        <template #cell-actions="{ row }">
          <div v-if="(row as unknown as ViolationRecord).status === 'open'" class="flex gap-1">
            <AppButton size="sm" variant="ghost" @click="openResolve(row as unknown as ViolationRecord)">處理</AppButton>
            <AppButton size="sm" variant="ghost" @click="handleDismiss(row as unknown as ViolationRecord)">駁回</AppButton>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- Review Modal -->
    <AppModal :open="showReviewModal" title="新增考核" width="max-w-lg" @close="showReviewModal = false">
      <ReviewForm :saving="reviewSaving" @submit="handleCreateReview" @cancel="showReviewModal = false" />
    </AppModal>

    <!-- Visibility Modal -->
    <AppModal :open="showVisibilityModal" title="可見性設定" @close="showVisibilityModal = false">
      <div class="space-y-3">
        <AppSelect v-model="(visForm.visibility as string)" label="可見性" :options="visibilityOptions" />
        <div v-if="visForm.visibility === 'visible'" class="grid grid-cols-2 gap-3">
          <AppInput v-model="visForm.visibleFrom" label="開放起（選填）" type="date" />
          <AppInput v-model="visForm.visibleUntil" label="開放迄（選填）" type="date" />
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showVisibilityModal = false">取消</AppButton>
        <AppButton @click="handleUpdateVisibility">儲存</AppButton>
      </template>
    </AppModal>

    <!-- Violation Modal -->
    <AppModal :open="showViolationModal" title="新增違規紀錄" @close="showViolationModal = false">
      <form class="space-y-3" @submit.prevent="handleCreateViolation">
        <AppInput v-model="violationForm.therapistUserId" label="心理師 ID" type="number" />
        <AppInput v-model="violationForm.incidentDate" label="發生日期" type="date" />
        <AppSelect v-model="(violationForm.severity as string)" label="嚴重度" :options="severityOptions" />
        <div>
          <label class="block text-sm font-medium text-app-text mb-1">描述</label>
          <textarea v-model="violationForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm" />
        </div>
        <AppInput v-model="violationForm.actionTaken" label="處置（選填）" />
      </form>
      <template #footer>
        <AppButton variant="secondary" @click="showViolationModal = false">取消</AppButton>
        <AppButton :loading="violationSaving" @click="handleCreateViolation">記錄</AppButton>
      </template>
    </AppModal>

    <!-- Resolve Modal -->
    <AppModal :open="showResolveModal" title="處理違規" @close="showResolveModal = false">
      <div class="space-y-3">
        <AppInput v-model="resolveActionTaken" label="處置說明" placeholder="說明採取的處置" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showResolveModal = false">取消</AppButton>
        <AppButton @click="handleResolve">確認</AppButton>
      </template>
    </AppModal>
  </div>
</template>
