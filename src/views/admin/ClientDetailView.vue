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
import ClientMemoList from '@/components/client/ClientMemoList.vue'
import PaymentStatusBadge from '@/components/billing/PaymentStatusBadge.vue'
import PackageUsageBar from '@/components/billing/PackageUsageBar.vue'
import { clientDetailAccess } from '@/utils/clientDetailAccess'
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

// clientId 字串僅供路由 query 使用（例如導向新增晤談紀錄）
const clientId = computed(() => route.params.id as string)
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
  } catch {
    uiStore.showToast('更新失敗', 'error')
  }
}

// ── Save Info ───────────────────────────────
async function handleSaveInfo(payload: UpdateClientRequest) {
  try {
    await clientStore.updateClient(clientIdNum.value, payload)
    uiStore.showToast('資料已更新', 'success')
  } catch {
    uiStore.showToast('更新失敗', 'error')
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
  } catch {
    uiStore.showToast('指派失敗', 'error')
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
  } catch {
    uiStore.showToast('簽署失敗', 'error')
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

// ── Session Notes ───────────────────────────
const clientNotes = computed(() =>
  sessionNoteStore.notes
    .filter((n) => n.clientProfileId === clientIdNum.value)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const expandedNoteId = ref<number | null>(null)

function toggleNote(id: number) {
  expandedNoteId.value = expandedNoteId.value === id ? null : id
}

function formatNoteDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Billing ─────────────────────────────────
const clientBillingRecords = computed(() =>
  billingStore.records
    .filter((r) => r.clientProfileId === clientIdNum.value)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const clientPackages = computed(() =>
  billingStore.clientPackages.filter((p) => p.clientProfileId === clientIdNum.value),
)

const pendingTotal = computed(() =>
  clientBillingRecords.value
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.finalAmount, 0),
)

function formatCurrency(val: number): string {
  return `$${val.toLocaleString()}`
}

// ── Client Memos ────────────────────────────
async function handleCreateMemo(payload: CreateMemoRequest) {
  try {
    await sessionNoteStore.createMemo(payload)
    uiStore.showToast('備忘已新增', 'success')
  } catch {
    uiStore.showToast('新增失敗', 'error')
  }
}

async function handleUpdateMemo(id: number, payload: UpdateMemoRequest) {
  try {
    await sessionNoteStore.updateMemo(id, payload)
    uiStore.showToast('備忘已更新', 'success')
  } catch {
    uiStore.showToast('更新失敗', 'error')
  }
}

async function handleDeleteMemo(id: number) {
  try {
    await sessionNoteStore.deleteMemo(id)
    uiStore.showToast('備忘已刪除', 'success')
  } catch {
    uiStore.showToast('刪除失敗', 'error')
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
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-app-text">
          {{ clientStore.currentClient.name }}
        </h1>
        <div class="flex items-center gap-2 mt-1">
          <AppBadge :variant="statusVariant[clientStore.currentClient.status]">
            {{ statusLabel[clientStore.currentClient.status] }}
          </AppBadge>
          <span v-if="clientStore.currentClient.therapists.length > 0" class="text-sm text-gray-500">
            心理師：{{ clientStore.currentClient.therapists.map((t) => t.therapistName).join('、') }}
          </span>
        </div>
      </div>
      <div v-if="canManageClient" class="flex gap-2">
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
      <div v-if="activeTab === 'sessions'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">晤談紀錄</h3>
          <AppButton
            size="sm"
            @click="$router.push({ path: '/admin/sessions/new', query: { clientId: clientId, clientName: clientStore.currentClient?.name } })"
          >
            新增紀錄
          </AppButton>
        </div>

        <div v-if="clientNotes.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
          尚無晤談紀錄
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="note in clientNotes"
            :key="note.id"
            class="bg-white border border-gray-200 rounded-app overflow-hidden"
          >
            <button
              class="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
              @click="toggleNote(note.id)"
            >
              <div class="flex items-center gap-3">
                <span class="text-gray-600 font-medium">{{ formatNoteDate(note.createdAt) }}</span>
                <AppBadge :variant="note.type === 'closure' ? 'warning' : 'default'">
                  {{ note.type === 'closure' ? '結案摘要' : '晤談' }}
                </AppBadge>
                <span class="text-xs text-gray-400">{{ note.format === 'soap' ? 'SOAP' : '自由文字' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="note.isLocked" class="text-yellow-500 text-xs">🔒</span>
                <span class="text-gray-400">{{ expandedNoteId === note.id ? '▲' : '▼' }}</span>
              </div>
            </button>
            <div v-if="expandedNoteId === note.id" class="px-4 pb-4 border-t border-gray-100">
              <div v-if="note.format === 'soap'" class="space-y-2 mt-3 text-sm">
                <div v-for="soap in [
                  { label: 'S', val: note.soapS },
                  { label: 'O', val: note.soapO },
                  { label: 'A', val: note.soapA },
                  { label: 'P', val: note.soapP },
                ]" :key="soap.label">
                  <p class="text-xs font-medium text-gray-500 uppercase">{{ soap.label }}</p>
                  <p class="text-gray-700 whitespace-pre-wrap">{{ soap.val || '—' }}</p>
                </div>
              </div>
              <div v-else-if="note.freeTextContent" class="mt-3">
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ note.freeTextContent }}</p>
              </div>
              <div class="flex gap-2 mt-3">
                <AppButton
                  v-if="!note.isLocked"
                  size="sm" variant="ghost"
                  @click="$router.push(`/admin/sessions/${note.id}/edit`)"
                >
                  編輯
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'billing'" class="space-y-6">
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
              <p class="text-xs text-gray-400 mt-2">到期日：{{ new Date(pkg.expiresAt).toLocaleDateString('zh-TW') }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Records -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-3">付款紀錄</h4>
          <div v-if="clientBillingRecords.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
            尚無付款紀錄
          </div>
          <div v-else class="bg-white border border-gray-200 rounded-app overflow-hidden">
            <table class="w-full text-sm">
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
                  <td class="px-4 py-2">{{ new Date(rec.createdAt).toLocaleDateString('zh-TW') }}</td>
                  <td class="px-4 py-2 text-right">{{ formatCurrency(rec.originalAmount) }}</td>
                  <td class="px-4 py-2 text-right">{{ formatCurrency(rec.finalAmount) }}</td>
                  <td class="px-4 py-2"><PaymentStatusBadge :status="rec.status" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
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

      <!-- Tab: Audit (Owner only) -->
      <div v-if="activeTab === 'audit'" class="space-y-3">
        <h3 class="font-semibold text-gray-800">稽核紀錄</h3>
        <div v-if="clientAuditLogs.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
          尚無稽核紀錄
        </div>
        <div v-else class="bg-white border border-gray-200 rounded-app overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-2 text-left text-gray-600">時間</th>
                <th class="px-4 py-2 text-left text-gray-600">操作者</th>
                <th class="px-4 py-2 text-left text-gray-600">動作</th>
                <th class="px-4 py-2 text-left text-gray-600">描述</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in clientAuditLogs" :key="log.id" class="border-b border-gray-100">
                <td class="px-4 py-2 text-xs text-gray-500">{{ new Date(log.createdAt).toLocaleString('zh-TW') }}</td>
                <td class="px-4 py-2">{{ log.userName ?? '—' }}</td>
                <td class="px-4 py-2"><span class="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{{ log.action }}</span></td>
                <td class="px-4 py-2 text-gray-600">{{ log.description ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
