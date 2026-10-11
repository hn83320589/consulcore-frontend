<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useConsentStore } from '@/stores/consentStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTable from '@/components/ui/AppTable.vue'
import { notifyError } from '@/utils/notifyError'
import { formatDate } from '@/utils/format'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import type {
  ConsentTemplate,
  ConsentRecord,
  ConsentTriggerEvent,
  ConsentRecordStatus,
} from '@/types'

const consentStore = useConsentStore()
const uiStore = useUiStore()

// ── Template List & Editor ──────────────────
const selectedTemplateId = ref<number | null>(null)

const selectedTemplate = computed(() =>
  consentStore.templates.find((t) => t.id === selectedTemplateId.value) ?? null,
)

const editForm = ref({
  title: '',
  content: '',
  triggerEvent: '' as ConsentTriggerEvent | '',
})

const saving = ref(false)
const isNewTemplate = ref(false)

const triggerOptions = [
  { label: '首次來訪', value: 'first_visit' },
  { label: '年度續簽', value: 'annual_renewal' },
  { label: '服務變更', value: 'service_change' },
  { label: '手動', value: 'manual' },
]

const triggerLabels: Record<ConsentTriggerEvent, string> = {
  first_visit: '首次來訪',
  annual_renewal: '年度續簽',
  service_change: '服務變更',
  manual: '手動',
}

const statusLabels: Record<ConsentRecordStatus, string> = {
  pending: '待簽署',
  signed: '有效',
  voided: '已作廢',
}

const statusVariants: Record<ConsentRecordStatus, 'success' | 'danger' | 'default'> = {
  pending: 'default',
  signed: 'success',
  voided: 'danger',
}

function selectTemplate(t: ConsentTemplate) {
  selectedTemplateId.value = t.id
  isNewTemplate.value = false
  editForm.value = {
    title: t.title,
    content: t.content,
    triggerEvent: t.triggerEvent,
  }
}

function startNewTemplate() {
  selectedTemplateId.value = null
  isNewTemplate.value = true
  editForm.value = { title: '', content: '', triggerEvent: '' }
}

async function handleSaveTemplate() {
  if (!editForm.value.title || !editForm.value.triggerEvent) return
  saving.value = true
  try {
    const payload = {
      title: editForm.value.title,
      content: editForm.value.content,
      triggerEvent: editForm.value.triggerEvent as ConsentTriggerEvent,
    }
    if (isNewTemplate.value) {
      const created = await consentStore.createTemplate(payload)
      selectTemplate(created)
      uiStore.showToast('範本已建立', 'success')
    } else if (selectedTemplateId.value) {
      const updated = await consentStore.updateTemplate(selectedTemplateId.value, payload)
      selectTemplate(updated)
      uiStore.showToast('範本已更新', 'success')
    }
  } catch (e) {
    notifyError(e, '儲存失敗')
  } finally {
    saving.value = false
  }
}

async function handleDeleteTemplate() {
  if (!selectedTemplateId.value) return
  try {
    await consentStore.deleteTemplate(selectedTemplateId.value)
    selectedTemplateId.value = null
    isNewTemplate.value = false
    uiStore.showToast('範本已刪除', 'success')
  } catch (e) {
    notifyError(e, '刪除失敗')
  }
}

// ── Records Section ─────────────────────────
const recordColumns: TableColumn[] = [
  { key: 'clientName', label: '個案' },
  { key: 'templateTitle', label: '同意書' },
  { key: 'templateVersion', label: '版本', width: '60px' },
  { key: 'signedAt', label: '簽署日期', width: '120px' },
  { key: 'status', label: '狀態', width: '80px' },
  { key: 'actions', label: '操作', width: '80px' },
]

const recordTableData = computed(() =>
  consentStore.records,
)

// 簽署紀錄查詢：後端 GET /consent-records 支援 triggerEvent + status 篩選（空=全部）
const recordFilterTriggerEvent = ref<ConsentTriggerEvent | ''>('')
const recordFilterStatus = ref<ConsentRecordStatus | ''>('')

function handleRecordFilter() {
  consentStore.fetchRecords({
    triggerEvent: recordFilterTriggerEvent.value || undefined,
    status: recordFilterStatus.value || undefined,
  })
}

// ── View Record Modal ───────────────────────
const viewingRecord = ref<ConsentRecord | null>(null)

function viewRecord(rec: ConsentRecord) {
  viewingRecord.value = rec
}

// ── Init ────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    consentStore.fetchTemplates(),
    consentStore.fetchRecords(),
  ])
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-app-text mb-6">同意書管理</h1>

    <!-- ── Template Section ─────────────────── -->
    <div class="grid grid-cols-3 gap-6 mb-8">
      <!-- Left: Template List -->
      <div class="col-span-1">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-700">範本列表</h2>
          <AppButton size="sm" @click="startNewTemplate">新增</AppButton>
        </div>
        <div class="space-y-2">
          <button
            v-for="t in consentStore.templates"
            :key="t.id"
            class="w-full text-left p-3 border rounded-app text-sm transition-colors"
            :class="selectedTemplateId === t.id
              ? 'border-primary bg-blue-50'
              : 'border-gray-200 hover:bg-gray-50'"
            @click="selectTemplate(t)"
          >
            <p class="font-medium text-gray-800">{{ t.title }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-400">v{{ t.version }}</span>
              <span class="text-xs text-gray-400">{{ triggerLabels[t.triggerEvent] }}</span>
              <AppBadge :variant="t.isActive ? 'success' : 'default'" class="text-[10px]">
                {{ t.isActive ? '啟用' : '停用' }}
              </AppBadge>
            </div>
          </button>
          <p v-if="consentStore.templates.length === 0" class="text-sm text-gray-400 p-3">
            尚無範本
          </p>
        </div>
      </div>

      <!-- Right: Template Editor -->
      <div class="col-span-2 bg-white border border-gray-200 rounded-app p-6">
        <template v-if="isNewTemplate || selectedTemplate">
          <h2 class="font-semibold text-gray-700 mb-4">
            {{ isNewTemplate ? '新增範本' : '編輯範本' }}
          </h2>
          <div class="space-y-4">
            <AppInput v-model="editForm.title" label="標題" placeholder="同意書標題" />
            <AppSelect
              v-model="(editForm.triggerEvent as string)"
              label="觸發事件"
              :options="triggerOptions"
            />
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">內容</label>
              <textarea
                v-model="editForm.content"
                rows="12"
                class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="支援 HTML 格式..."
              />
            </div>
            <div v-if="selectedTemplate" class="text-xs text-gray-400">
              版本：v{{ selectedTemplate.version }} · 更新：{{ formatDate(selectedTemplate.updatedAt) }}
            </div>
            <div class="flex gap-2">
              <AppButton :loading="saving" @click="handleSaveTemplate">
                {{ isNewTemplate ? '建立' : '儲存' }}
              </AppButton>
              <AppButton
                v-if="!isNewTemplate"
                variant="danger"
                @click="handleDeleteTemplate"
              >
                刪除
              </AppButton>
            </div>
          </div>
        </template>
        <div v-else class="flex items-center justify-center h-64 text-gray-400 text-sm">
          選擇左側範本或新增一個
        </div>
      </div>
    </div>

    <!-- ── Records Section ──────────────────── -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-700">簽署紀錄</h2>
        <div class="flex items-center gap-2">
          <select
            v-model="recordFilterTriggerEvent"
            class="px-3 py-1.5 border border-gray-300 rounded-app text-sm bg-white"
            @change="handleRecordFilter"
          >
            <option value="">全部觸發事件</option>
            <option v-for="opt in triggerOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select
            v-model="recordFilterStatus"
            class="px-3 py-1.5 border border-gray-300 rounded-app text-sm bg-white"
            @change="handleRecordFilter"
          >
            <option value="">全部狀態</option>
            <option v-for="(label, val) in statusLabels" :key="val" :value="val">{{ label }}</option>
          </select>
        </div>
      </div>

      <AppTable :columns="recordColumns" :data="recordTableData" :loading="consentStore.loading">
        <template #cell-templateVersion="{ value }">
          v{{ value }}
        </template>
        <template #cell-signedAt="{ row }">
          {{ formatDate(row.signedAt) }}
        </template>
        <template #cell-status="{ row }">
          <AppBadge :variant="statusVariants[row.status]">
            {{ statusLabels[row.status] }}
          </AppBadge>
        </template>
        <template #cell-actions="{ row }">
          <AppButton size="sm" variant="ghost" @click="viewRecord(row)">
            查看
          </AppButton>
        </template>
      </AppTable>
    </div>

    <!-- View Record Modal -->
    <AppModal
      :open="!!viewingRecord"
      :title="viewingRecord?.templateTitle ?? ''"
      width="max-w-2xl"
      @close="viewingRecord = null"
    >
      <div v-if="viewingRecord">
        <div class="flex items-center gap-2 mb-4">
          <AppBadge :variant="statusVariants[viewingRecord.status]">
            {{ statusLabels[viewingRecord.status] }}
          </AppBadge>
          <span class="text-sm text-gray-500">
            v{{ viewingRecord.templateVersion }} ·
            {{ viewingRecord.clientName }} ·
            {{ formatDate(viewingRecord.signedAt) }}
          </span>
        </div>
        <div class="prose prose-sm max-w-none border-t border-gray-100 pt-4 mb-4 whitespace-pre-wrap">{{ viewingRecord.contentSnapshot }}</div>
        <div v-if="viewingRecord.signatureImage" class="border-t border-gray-100 pt-4">
          <p class="text-xs text-gray-500 mb-2">簽名</p>
          <img :src="viewingRecord.signatureImage" alt="簽名" class="h-20" />
        </div>
      </div>
    </AppModal>
  </div>
</template>
