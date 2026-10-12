<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useClientStore } from '@/stores/clientStore'
import { useConsentStore } from '@/stores/consentStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useSessionNoteStore } from '@/stores/sessionNoteStore'
import { useBillingStore } from '@/stores/billingStore'
import { useAuditStore } from '@/stores/auditStore'
import { useStaffStore } from '@/stores/staffStore'
import { useUiStore } from '@/stores/uiStore'
import AppTabs from '@/components/ui/AppTabs.vue'
import type { Tab } from '@/components/ui/AppTabs.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ClientInfoCard from '@/components/client/ClientInfoCard.vue'
import ConsentStatus from '@/components/client/ConsentStatus.vue'
import SignaturePad from '@/components/form/SignaturePad.vue'
import AppointmentList from '@/components/appointment/AppointmentList.vue'
import ClientSessionsTab from '@/components/client/detail/ClientSessionsTab.vue'
import ClientBillingTab from '@/components/client/detail/ClientBillingTab.vue'
import ClientAuditTab from '@/components/client/detail/ClientAuditTab.vue'
import ClientMemoList from '@/components/client/ClientMemoList.vue'
import { clientDetailAccess } from '@/utils/clientDetailAccess'
import { notifyError } from '@/utils/notifyError'
import type { UpdateClientRequest, ConsentRecord, ClientStatus, Appointment, CreateMemoRequest, UpdateMemoRequest } from '@/types'

const route = useRoute()
const authStore = useAuthStore()
const clientStore = useClientStore()
const appointmentStore = useAppointmentStore()
const sessionNoteStore = useSessionNoteStore()
const billingStore = useBillingStore()
const auditStore = useAuditStore()
const consentStore = useConsentStore()
const staffStore = useStaffStore()
const uiStore = useUiStore()

// 個案域 API 使用數字 id
const clientIdNum = computed(() => Number(route.params.id))

// 後端以 resourceType(snake_case) + resourceId 精準查詢，這裡再過濾一次作為保險
const clientAuditLogs = computed(() =>
  auditStore.logs.filter(
    (log) => log.resourceType === 'client_profile' && log.resourceId === clientIdNum.value,
  ),
)

// ── Tabs ────────────────────────────────────
// 依 Sprint 8 權限矩陣以「角色語意」決定 tab 可見性（非 permission）：
// 晤談紀錄/備忘錄屬臨床私密資料，僅治療中的心理師可見（Owner 雖有權限仍刻意隱藏）；
// 稽核僅 Owner 可見。後端另有存取控制為最終防線。
const access = computed(() => clientDetailAccess(authStore.activeRole, authStore.hasPermission))
const isTherapist = computed(() => authStore.activeRole === 'therapist')

const tabs = computed<Tab[]>(() => [
  { key: 'info', label: '基本資料' },
  { key: 'appointments', label: '預約紀錄' },
  ...(access.value.sessions ? [{ key: 'sessions', label: '晤談紀錄' }] : []),
  ...(access.value.billing ? [{ key: 'billing', label: '收費紀錄' }] : []),
  { key: 'consents', label: '同意書' },
  ...(access.value.memos ? [{ key: 'memos', label: '備忘錄' }] : []),
  ...(access.value.audit ? [{ key: 'audit', label: '稽核' }] : []),
])

const activeTab = ref('info')

// BR-20 代診/交接：therapist 可唯讀檢視非自己被指派的個案，後端會留稽核。
// 判斷依據（契約 §7.3）：therapists 中不存在「自己且 status=active」的指派。
const isProxyView = computed(() => {
  const client = clientStore.currentClient
  if (!isTherapist.value || !client) return false
  return !client.therapists.some(
    (t) => t.therapistUserId === authStore.user?.id && t.status === 'active',
  )
})

// 寫入類操作依權限與代診狀態收斂（契約 §7.3；代診一律不可改）
const canManageClient = computed(() => authStore.hasPermission('client.manage'))
const canEditClient = computed(
  () => authStore.hasPermission('client.update') && !isProxyView.value,
)

// ── Status ──────────────────────────────────
const statusVariant: Record<ClientStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  pending: 'warning',
  active: 'success',
  suspended: 'default',
  closed: 'danger',
}
const statusLabel: Record<ClientStatus, string> = {
  pending: '待處理',
  active: '進行中',
  suspended: '暫停',
  closed: '結案',
}

async function changeStatus(status: ClientStatus) {
  try {
    await clientStore.updateStatus(clientIdNum.value, status)
    uiStore.showToast('狀態已更新', 'success')
  } catch (e) {
    notifyError(e, '更新失敗')
  }
}

// ── Save Info ───────────────────────────────
async function handleSaveInfo(payload: UpdateClientRequest) {
  try {
    await clientStore.updateClient(clientIdNum.value, payload)
    uiStore.showToast('資料已更新', 'success')
  } catch (e) {
    notifyError(e, '更新失敗')
  }
}

// ── Assign Therapist ────────────────────────
const showAssignModal = ref(false)
const selectedTherapistId = ref('')

// 啟用中的心理師，排除已指派本個案者
const therapistOptions = computed(() => {
  const assigned = new Set(clientStore.currentClient?.therapists.map((t) => t.therapistUserId) ?? [])
  return staffStore.users
    .filter((u) => u.isActive && u.roles.includes('therapist') && !assigned.has(u.id))
    .map((u) => ({ value: String(u.id), label: u.displayName }))
})

async function handleAssign() {
  if (!selectedTherapistId.value) return
  try {
    await clientStore.assignTherapist(clientIdNum.value, Number(selectedTherapistId.value))
    uiStore.showToast('已指派心理師', 'success')
    selectedTherapistId.value = ''
    showAssignModal.value = false
  } catch (e) {
    notifyError(e, '指派失敗')
  }
}

// ── Consent Sign ────────────────────────────
const showSignModal = ref(false)
const signTemplateId = ref('')

const templateOptions = computed(() =>
  consentStore.templates
    .filter((t) => t.isActive)
    .map((t) => ({ label: t.title, value: String(t.id) })),
)

const clientConsentRecords = computed(() =>
  consentStore.records.filter((r) => r.clientProfileId === clientIdNum.value),
)

async function handleSign(dataUrl: string) {
  if (!signTemplateId.value) return
  try {
    await consentStore.signConsent({
      consentTemplateId: Number(signTemplateId.value),
      clientProfileId: clientIdNum.value,
      signatureImage: dataUrl,
      signedRemotely: false,
    })
    uiStore.showToast('同意書已簽署', 'success')
    showSignModal.value = false
  } catch (e) {
    notifyError(e, '簽署失敗')
  }
}

// ── Appointments ────────────────────────────
const clientAppointments = computed(() =>
  appointmentStore.appointments
    .filter((a) => a.clientProfileId === clientIdNum.value)
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)),
)

const clientSeries = computed(() => appointmentStore.clientSeries)

function handleAppointmentClick(_apt: Appointment) {
  // 可擴展為顯示詳情 modal
}

// ── Client Memos ────────────────────────────
async function handleCreateMemo(payload: CreateMemoRequest) {
  try {
    await sessionNoteStore.createMemo(payload)
    uiStore.showToast('備忘已新增', 'success')
  } catch (e) {
    notifyError(e, '新增失敗')
  }
}

async function handleUpdateMemo(id: number, payload: UpdateMemoRequest) {
  try {
    await sessionNoteStore.updateMemo(id, payload)
    uiStore.showToast('備忘已更新', 'success')
  } catch (e) {
    notifyError(e, '更新失敗')
  }
}

async function handleDeleteMemo(id: number) {
  try {
    await sessionNoteStore.deleteMemo(id)
    uiStore.showToast('備忘已刪除', 'success')
  } catch (e) {
    notifyError(e, '刪除失敗')
  }
}

// ── View Consent Record ─────────────────────
const viewingRecord = ref<ConsentRecord | null>(null)

function handleViewRecord(record: ConsentRecord) {
  viewingRecord.value = record
}

// ── Init ────────────────────────────────────
onMounted(async () => {
  const id = clientIdNum.value
  const can = access.value
  // allSettled：單一區塊失敗（錯誤訊息已由 httpService 顯示）不影響其他區塊載入
  await Promise.allSettled([
    clientStore.fetchClient(id),
    appointmentStore.fetchAppointments({ clientProfileId: id }),
    appointmentStore.fetchSeriesByClient(id),
    ...(can.staff ? [staffStore.fetchUsers()] : []),
    ...(can.sessions ? [sessionNoteStore.fetchNotesByClient(id)] : []),
    ...(can.memos ? [sessionNoteStore.fetchMemos(id)] : []),
    ...(can.billing
      ? [billingStore.fetchRecords({ clientProfileId: id }), billingStore.fetchClientPackages({ clientProfileId: id })]
      : []),
    ...(can.audit ? [auditStore.fetchLogs({ resourceType: 'client_profile', resourceId: id })] : []),
    consentStore.fetchTemplates(),
    consentStore.fetchRecordsByClient(id),
  ])
})
</script>

<template>
  <div v-if="clientStore.currentClient">
    <!-- Header：窄螢幕時操作按鈕換到下一列 -->
    <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-bold text-app-text">
          {{ clientStore.currentClient.name }}
        </h1>
        <div class="flex flex-wrap items-center gap-2 mt-1">
          <AppBadge :variant="statusVariant[clientStore.currentClient.status]">
            {{ statusLabel[clientStore.currentClient.status] }}
          </AppBadge>
          <span v-if="clientStore.currentClient.therapists.length > 0" class="text-sm text-gray-500">
            心理師：{{ clientStore.currentClient.therapists.map((t) => t.therapistName).join('、') }}
          </span>
        </div>
      </div>
      <div v-if="canManageClient" class="flex flex-wrap gap-2">
        <AppButton size="sm" variant="secondary" @click="showAssignModal = true">
          指派心理師
        </AppButton>
        <AppButton
          v-if="clientStore.currentClient.status === 'active'"
          size="sm" variant="secondary"
          @click="changeStatus('suspended')"
        >
          暫停
        </AppButton>
        <AppButton
          v-if="clientStore.currentClient.status === 'suspended'"
          size="sm"
          @click="changeStatus('active')"
        >
          恢復
        </AppButton>
        <AppButton
          v-if="clientStore.currentClient.status !== 'closed'"
          size="sm" variant="danger"
          @click="changeStatus('closed')"
        >
          結案
        </AppButton>
      </div>
    </div>

    <!-- 代診唯讀提示（BR-20）：非自己被指派的個案 -->
    <div
      v-if="isProxyView"
      class="flex items-start gap-2 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-app"
    >
      <span class="text-amber-500 text-sm leading-none mt-0.5">⚠</span>
      <p class="text-sm text-amber-700">
        此個案非您負責，您正以代診身分唯讀檢視，本次檢視已記錄稽核。
      </p>
    </div>

    <!-- Tabs -->
    <AppTabs v-model="activeTab" :tabs="tabs">
      <!-- Tab 1: 基本資料 -->
      <div v-if="activeTab === 'info'" class="space-y-6">
        <ClientInfoCard
          :client="clientStore.currentClient"
          :readonly="!canEditClient"
          @save="handleSaveInfo"
        />

        <!-- Consent Status -->
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">同意書</h3>
          <AppButton size="sm" variant="secondary" @click="showSignModal = true">
            簽署同意書
          </AppButton>
        </div>
        <ConsentStatus
          :records="clientConsentRecords"
          @view="handleViewRecord"
        />
      </div>

      <!-- Tab 2: 預約紀錄 -->
      <div v-if="activeTab === 'appointments'" class="space-y-6">
        <!-- Series Info -->
        <div v-if="clientSeries.length > 0" class="bg-blue-50 border border-blue-100 rounded-app p-4">
          <h4 class="font-medium text-blue-800 text-sm mb-2">常態性預約</h4>
          <div v-for="s in clientSeries" :key="s.id" class="text-sm text-blue-700">
            {{ s.therapistName }} · 每{{ ['日','一','二','三','四','五','六'][s.dayOfWeek] }}
            {{ s.startTime }} · {{ s.frequency === 'weekly' ? '每週' : '每兩週' }}
            · 剩 {{ s.remainingAppointments }}/{{ s.totalAppointments }} 次
            <span v-if="s.status !== 'active'" class="text-blue-400">（{{ s.status === 'ended' ? '已結束' : '待確認' }}）</span>
          </div>
        </div>

        <!-- Appointment List -->
        <AppointmentList
          :appointments="clientAppointments"
          :loading="appointmentStore.loading"
          @click="handleAppointmentClick"
        />
      </div>
      <ClientSessionsTab v-if="activeTab === 'sessions'" :client-id="clientIdNum" />
      <ClientBillingTab v-if="activeTab === 'billing'" :client-id="clientIdNum" />
      <div v-if="activeTab === 'consents'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">同意書</h3>
          <AppButton size="sm" variant="secondary" @click="showSignModal = true">簽署同意書</AppButton>
        </div>
        <ConsentStatus :records="clientConsentRecords" @view="handleViewRecord" />
      </div>
      <div v-if="activeTab === 'memos'">
        <ClientMemoList
          :memos="sessionNoteStore.memos"
          :client-profile-id="clientIdNum"
          @create="handleCreateMemo"
          @update="handleUpdateMemo"
          @delete="handleDeleteMemo"
        />
      </div>

      <ClientAuditTab v-if="activeTab === 'audit'" :logs="clientAuditLogs" />
    </AppTabs>

    <!-- Assign Therapist Modal -->
    <AppModal :open="showAssignModal" title="指派心理師" @close="showAssignModal = false">
      <AppSelect
        v-model="selectedTherapistId"
        label="選擇心理師"
        :options="therapistOptions"
        placeholder="請選擇心理師"
      />
      <template #footer>
        <AppButton variant="secondary" @click="showAssignModal = false">取消</AppButton>
        <AppButton :disabled="!selectedTherapistId" @click="handleAssign">確認指派</AppButton>
      </template>
    </AppModal>

    <!-- Sign Consent Modal -->
    <AppModal :open="showSignModal" title="簽署同意書" width="max-w-xl" @close="showSignModal = false">
      <div class="space-y-4">
        <AppSelect
          v-model="signTemplateId"
          label="選擇同意書範本"
          :options="templateOptions"
        />
        <div v-if="signTemplateId">
          <p class="text-sm text-gray-500 mb-3">請在下方簽名</p>
          <SignaturePad @sign="handleSign" />
        </div>
      </div>
    </AppModal>

    <!-- View Consent Record Modal -->
    <AppModal
      :open="!!viewingRecord"
      :title="viewingRecord?.templateTitle ?? '同意書'"
      width="max-w-2xl"
      @close="viewingRecord = null"
    >
      <div v-if="viewingRecord">
        <div class="prose prose-sm max-w-none mb-4 whitespace-pre-wrap">{{ viewingRecord.contentSnapshot }}</div>
        <div v-if="viewingRecord.signatureImage" class="border-t border-gray-200 pt-4">
          <p class="text-xs text-gray-500 mb-2">簽名</p>
          <img :src="viewingRecord.signatureImage" alt="簽名" class="h-20" />
        </div>
        <p v-if="viewingRecord.signedAt" class="text-xs text-gray-400 mt-3">
          簽署時間：{{ new Date(viewingRecord.signedAt).toLocaleString('zh-TW') }}
        </p>
      </div>
    </AppModal>
  </div>

  <div v-else-if="clientStore.loading" class="text-center py-12 text-gray-400">
    載入中...
  </div>
</template>
