<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import type { NotificationTemplate } from '@/types'
import { notificationEventMeta } from '@/types'
import { notifyError } from '@/utils/notifyError'

const store = useNotificationStore()
const uiStore = useUiStore()

const columns: TableColumn[] = [
  { key: 'eventType', label: '事件類型' },
  { key: 'channel', label: '管道', width: '80px' },
  { key: 'subject', label: '主旨' },
  { key: 'isActive', label: '狀態', width: '80px' },
  { key: 'isRequired', label: '必要', width: '60px' },
  { key: 'actions', label: '', width: '60px' },
]

const tableData = () => store.templates

const channelLabels: Record<string, string> = {
  email: 'Email',
  sms: '簡訊',
  in_app: '站內',
}

function eventLabel(eventType: NotificationTemplate['eventType']): string {
  return notificationEventMeta[eventType]?.label ?? eventType
}

// 可插入的變數提示（供編輯者參考）
const availableVariables = ['client_name', 'therapist_name', 'date', 'time']

// ── Edit Modal ──────────────────────────────
const showModal = ref(false)
const editing = ref<NotificationTemplate | null>(null)
const editForm = ref({ subject: '', bodyTemplate: '', isActive: true })
const saving = ref(false)
const showPreview = ref(false)

function openEdit(tpl: NotificationTemplate) {
  editing.value = tpl
  editForm.value = { subject: tpl.subject, bodyTemplate: tpl.bodyTemplate, isActive: tpl.isActive }
  showPreview.value = false
  showModal.value = true
}

async function handleSave() {
  if (!editing.value) return
  saving.value = true
  try {
    await store.updateTemplate(editing.value.id, editForm.value)
    uiStore.showToast('已更新', 'success')
    showModal.value = false
  } catch (e) { notifyError(e, '更新失敗') }
  finally { saving.value = false }
}

onMounted(() => store.fetchTemplates())
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-app-text mb-6">通知範本</h1>

    <AppTable :columns="columns" :data="tableData()">
      <template #cell-eventType="{ row }">
        {{ eventLabel(row.eventType) }}
      </template>
      <template #cell-channel="{ row }">
        {{ channelLabels[row.channel] ?? row.channel }}
      </template>
      <template #cell-isActive="{ row }">
        <AppBadge :variant="row.isActive ? 'success' : 'danger'">
          {{ row.isActive ? '啟用' : '停用' }}
        </AppBadge>
      </template>
      <template #cell-isRequired="{ row }">
        <span v-if="row.isRequired" class="text-xs text-red-500">必要</span>
      </template>
      <template #cell-actions="{ row }">
        <AppButton size="sm" variant="ghost" @click="openEdit(row)">編輯</AppButton>
      </template>
    </AppTable>

    <!-- Edit Modal -->
    <AppModal :open="showModal" title="編輯通知範本" width="max-w-xl" @close="showModal = false">
      <div v-if="editing" class="space-y-4">
        <AppInput v-model="editForm.subject" label="主旨" />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">內容</label>
          <textarea
            v-model="editForm.bodyTemplate"
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm"
          />
          <p class="text-xs text-gray-400 mt-1">
            可用變數：{{ availableVariables.map(v => '{' + '{' + v + '}' + '}').join('、') }}
          </p>
        </div>
        <label class="flex items-center gap-2">
          <input
            v-model="editForm.isActive"
            type="checkbox"
            :disabled="editing.isRequired"
            class="accent-[var(--color-primary)]"
          />
          <span class="text-sm text-gray-600">
            啟用
            <span v-if="editing.isRequired" class="text-red-400">（必要通知不可停用）</span>
          </span>
        </label>

        <!-- Preview -->
        <div>
          <button class="text-xs text-primary hover:underline" @click="showPreview = !showPreview">
            {{ showPreview ? '隱藏預覽' : '顯示預覽' }}
          </button>
          <div v-if="showPreview" class="mt-2 bg-gray-50 border border-gray-200 rounded-app p-4 text-sm">
            <p class="font-medium mb-1">{{ editForm.subject }}</p>
            <p class="text-gray-600 whitespace-pre-wrap">{{ editForm.bodyTemplate }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">取消</AppButton>
        <AppButton :loading="saving" @click="handleSave">儲存</AppButton>
      </template>
    </AppModal>
  </div>
</template>
