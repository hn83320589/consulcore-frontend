<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import TemplateEditor from '@/components/schedule/TemplateEditor.vue'
import type { TemplateFormValue } from '@/components/schedule/TemplateEditor.vue'
import SlotGrid from '@/components/schedule/SlotGrid.vue'
import ConflictAlert from '@/components/schedule/ConflictAlert.vue'
import { detectRoomConflicts } from '@/utils/scheduleConflicts'
import type { Conflict } from '@/components/schedule/ConflictAlert.vue'
import type {
  ScheduleTemplate,
  ScheduleSlot,
  CreateScheduleTemplateRequest,
  UpdateScheduleTemplateRequest,
  ExpandResult,
} from '@/types'

const scheduleStore = useScheduleStore()
const uiStore = useUiStore()

const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

// ── Month Selector ──────────────────────────
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth() + 1)

const monthLabel = computed(() => `${viewYear.value} 年 ${viewMonth.value} 月`)

function prevMonth() {
  if (viewMonth.value === 1) {
    viewMonth.value = 12
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 12) {
    viewMonth.value = 1
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function getMonthRange(y: number, m: number) {
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { startDate, endDate }
}

async function loadSlots() {
  const { startDate, endDate } = getMonthRange(viewYear.value, viewMonth.value)
  await scheduleStore.fetchSlots({ startDate, endDate })
}

watch([viewYear, viewMonth], () => loadSlots())

// ── Template Selection ──────────────────────
const selectedTemplateId = ref<number | null>(null)

const selectedTemplate = computed<ScheduleTemplate | null>(() =>
  scheduleStore.templates.find((t) => t.id === selectedTemplateId.value) ?? null,
)

function selectTemplate(t: ScheduleTemplate) {
  selectedTemplateId.value = t.id
}

function startNewTemplate() {
  selectedTemplateId.value = null
}

// ── Save Template ───────────────────────────
const savingTemplate = ref(false)

async function handleSaveTemplate(value: TemplateFormValue) {
  savingTemplate.value = true
  try {
    if (selectedTemplate.value) {
      // 契約 Update 僅允許 start/end/duration/isActive
      const payload: UpdateScheduleTemplateRequest = {
        startTime: value.startTime,
        endTime: value.endTime,
        slotDuration: value.slotDuration,
        isActive: value.isActive,
      }
      await scheduleStore.updateTemplate(selectedTemplate.value.id, payload)
      uiStore.showToast('範本已更新', 'success')
    } else {
      const payload: CreateScheduleTemplateRequest = {
        therapistUserId: value.therapistUserId,
        dayOfWeek: value.dayOfWeek,
        startTime: value.startTime,
        endTime: value.endTime,
        slotDuration: value.slotDuration,
      }
      const created = await scheduleStore.createTemplate(payload)
      selectedTemplateId.value = created.id
      uiStore.showToast('範本已建立', 'success')
    }
  } catch {
    uiStore.showToast('儲存失敗', 'error')
  } finally {
    savingTemplate.value = false
  }
}

async function handleDeleteTemplate() {
  if (!selectedTemplate.value) return
  try {
    await scheduleStore.deleteTemplate(selectedTemplate.value.id)
    uiStore.showToast('範本已刪除', 'success')
    selectedTemplateId.value = null
  } catch {
    uiStore.showToast('刪除失敗', 'error')
  }
}

// ── Expand Slots（直接展班，無預覽步驟） ──────
const expanding = ref(false)
const showResultModal = ref(false)
const expandResult = ref<ExpandResult | null>(null)

async function handleExpand() {
  expanding.value = true
  try {
    const { startDate, endDate } = getMonthRange(viewYear.value, viewMonth.value)
    const result = await scheduleStore.expandSlots({ startDate, endDate })
    expandResult.value = result
    showResultModal.value = true
    await loadSlots()
  } catch {
    uiStore.showToast('展班失敗', 'error')
  } finally {
    expanding.value = false
  }
}

// ── Slot Click (block/unblock) ──────────────
const showSlotModal = ref(false)
const clickedSlot = ref<ScheduleSlot | null>(null)
const slotNote = ref('')

const statusLabels: Record<ScheduleSlot['status'], string> = {
  available: '可預約',
  reserved: '已預約',
  blocked: '已封鎖',
  cancelled: '已取消',
}

function handleSlotClick(slot: ScheduleSlot) {
  clickedSlot.value = slot
  slotNote.value = slot.note ?? ''
  showSlotModal.value = true
}

async function handleBlockSlot() {
  if (!clickedSlot.value) return
  try {
    await scheduleStore.blockSlot(clickedSlot.value.id, slotNote.value || undefined)
    uiStore.showToast('時段已封鎖', 'success')
    showSlotModal.value = false
  } catch {
    uiStore.showToast('操作失敗', 'error')
  }
}

async function handleUnblockSlot() {
  if (!clickedSlot.value) return
  try {
    await scheduleStore.unblockSlot(clickedSlot.value.id)
    uiStore.showToast('時段已解除封鎖', 'success')
    showSlotModal.value = false
  } catch {
    uiStore.showToast('操作失敗', 'error')
  }
}

// ── Conflict Detection（同診間時段重疊） ────
const conflicts = computed<Conflict[]>(() => detectRoomConflicts(scheduleStore.slots))

// ── Init ────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    scheduleStore.fetchRooms(),
    scheduleStore.fetchTemplates(),
    loadSlots(),
  ])
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-app-text mb-6">排班管理</h1>

    <!-- Conflict Alert -->
    <ConflictAlert :conflicts="conflicts" />

    <!-- ── Template Section ─────────────────── -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-gray-700">排班範本</h2>
        <AppButton size="sm" variant="secondary" @click="startNewTemplate">新範本</AppButton>
      </div>

      <!-- Template list -->
      <div v-if="scheduleStore.templates.length > 0" class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="t in scheduleStore.templates"
          :key="t.id"
          class="px-3 py-2 rounded-app border text-sm text-left transition-colors"
          :class="
            t.id === selectedTemplateId
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          "
          @click="selectTemplate(t)"
        >
          <span class="font-medium">{{ t.therapistName }}</span>
          <span class="text-gray-400 mx-1">·</span>
          <span>週{{ dayLabels[t.dayOfWeek] }}</span>
          <span class="text-gray-400 mx-1">·</span>
          <span>{{ t.startTime.slice(0, 5) }}-{{ t.endTime.slice(0, 5) }}</span>
          <span v-if="!t.isActive" class="text-gray-400 ml-1">（停用）</span>
        </button>
      </div>
      <p v-else class="text-sm text-gray-400 mb-4">尚無排班範本，請新增。</p>

      <TemplateEditor
        :template="selectedTemplate"
        :saving="savingTemplate"
        @save="handleSaveTemplate"
      />

      <div v-if="selectedTemplate" class="mt-2 text-right">
        <AppButton size="sm" variant="danger" @click="handleDeleteTemplate">刪除此範本</AppButton>
      </div>
    </div>

    <!-- ── Calendar Section ─────────────────── -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <AppButton size="sm" variant="ghost" @click="prevMonth">←</AppButton>
          <h2 class="font-semibold text-gray-700 min-w-[120px] text-center">{{ monthLabel }}</h2>
          <AppButton size="sm" variant="ghost" @click="nextMonth">→</AppButton>
        </div>

        <div class="flex gap-2">
          <AppButton size="sm" variant="secondary" :loading="expanding" @click="handleExpand">
            展班本月
          </AppButton>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-green-100 border border-green-200"></span> 可預約
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-blue-100 border border-blue-200"></span> 已預約
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-gray-100 border border-gray-200"></span> 已封鎖
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-red-50 border border-red-200"></span> 已取消
        </span>
      </div>

      <SlotGrid
        :year="viewYear"
        :month="viewMonth"
        :slots-by-date="scheduleStore.slotsByDate"
        @slot-click="handleSlotClick"
      />
    </div>

    <!-- ── Expand Result Modal ──────────────── -->
    <AppModal :open="showResultModal" title="展班結果" @close="showResultModal = false">
      <div v-if="expandResult" class="space-y-3 text-sm text-gray-600">
        <p>
          已產生 <span class="font-semibold text-primary">{{ expandResult.createdCount }}</span> 個時段，
          略過 <span class="font-semibold">{{ expandResult.skippedCount }}</span> 個（已存在）。
        </p>
        <div v-if="expandResult.warnings.length > 0">
          <p class="font-medium text-amber-600 mb-1">提醒：</p>
          <ul class="list-disc list-inside space-y-1 text-amber-600">
            <li v-for="(w, i) in expandResult.warnings" :key="i">{{ w }}</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <AppButton @click="showResultModal = false">關閉</AppButton>
      </template>
    </AppModal>

    <!-- ── Slot Detail Modal ────────────────── -->
    <AppModal :open="showSlotModal" title="時段詳情" @close="showSlotModal = false">
      <div v-if="clickedSlot" class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-gray-500">日期</p>
            <p class="font-medium">{{ clickedSlot.date }}</p>
          </div>
          <div>
            <p class="text-gray-500">時段</p>
            <p class="font-medium">{{ clickedSlot.startTime }} - {{ clickedSlot.endTime }}</p>
          </div>
          <div>
            <p class="text-gray-500">心理師</p>
            <p class="font-medium">{{ clickedSlot.therapistName }}</p>
          </div>
          <div>
            <p class="text-gray-500">診間</p>
            <p class="font-medium">{{ clickedSlot.roomName ?? '未指定' }}</p>
          </div>
          <div>
            <p class="text-gray-500">狀態</p>
            <p class="font-medium">{{ statusLabels[clickedSlot.status] }}</p>
          </div>
        </div>

        <div v-if="clickedSlot.status === 'available' || clickedSlot.status === 'blocked'">
          <AppInput v-model="slotNote" label="備註" placeholder="選填" />
        </div>
      </div>

      <template #footer>
        <AppButton variant="secondary" @click="showSlotModal = false">關閉</AppButton>
        <template v-if="clickedSlot?.status === 'available'">
          <AppButton variant="danger" @click="handleBlockSlot">封鎖此時段</AppButton>
        </template>
        <template v-else-if="clickedSlot?.status === 'blocked'">
          <AppButton @click="handleUnblockSlot">解除封鎖</AppButton>
        </template>
      </template>
    </AppModal>
  </div>
</template>
