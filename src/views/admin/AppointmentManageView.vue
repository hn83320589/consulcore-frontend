<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppointmentCalendar from '@/components/appointment/AppointmentCalendar.vue'
import AppointmentList from '@/components/appointment/AppointmentList.vue'
import AppointmentCard from '@/components/appointment/AppointmentCard.vue'
import QuickBookModal from '@/components/appointment/QuickBookModal.vue'
import { toLocalDateString } from '@/utils/date'
import type { Appointment, AppointmentStatus, CreateAppointmentRequest } from '@/types'

const appointmentStore = useAppointmentStore()
const uiStore = useUiStore()

// ── View Toggle ─────────────────────────────
const viewMode = ref<'calendar' | 'list'>('calendar')

// ── Filters ─────────────────────────────────
const filterTherapistId = ref('')
const filterStatus = ref('')
const filterFrom = ref('')
const filterTo = ref('')

function getDateRange() {
  const now = new Date()
  const startDate = filterFrom.value || toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1))
  const endDate = filterTo.value || toLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  return { startDate, endDate }
}

function therapistIdParam(): number | undefined {
  return filterTherapistId.value ? Number(filterTherapistId.value) : undefined
}

async function loadData() {
  const { startDate, endDate } = getDateRange()
  if (viewMode.value === 'calendar') {
    await appointmentStore.fetchCalendar(startDate, endDate, therapistIdParam())
  } else {
    await appointmentStore.fetchAppointments({
      therapistUserId: therapistIdParam(),
      status: (filterStatus.value as AppointmentStatus) || undefined,
    })
  }
}

// ── Calendar Interactions ────────────────────
const selectedAppointment = ref<Appointment | null>(null)
const showDetailModal = ref(false)

function handleEventClick(appointmentId: string) {
  const apt = appointmentStore.appointments.find((a) => a.id === Number(appointmentId))
  if (apt) {
    selectedAppointment.value = apt
    showDetailModal.value = true
  }
}

// ── Quick Book ──────────────────────────────
const showQuickBook = ref(false)

async function openQuickBook() {
  const { startDate, endDate } = getDateRange()
  await appointmentStore.fetchAvailableSlots({ startDate, endDate, therapistUserId: therapistIdParam() })
  showQuickBook.value = true
}

function handleDateSelect() {
  openQuickBook()
}

async function handleBook(payload: CreateAppointmentRequest) {
  try {
    const created = await appointmentStore.createAppointment(payload)
    const msg = created.hints.length > 0 ? `預約已建立（${created.hints.join('；')}）` : '預約已建立'
    uiStore.showToast(msg, 'success')
    showQuickBook.value = false
    await loadData()
  } catch {
    uiStore.showToast('建立失敗', 'error')
  }
}

// ── Status Actions ──────────────────────────
async function handleComplete(id: number) {
  try {
    await appointmentStore.complete(id)
    uiStore.showToast('已標記完成', 'success')
    showDetailModal.value = false
  } catch {
    uiStore.showToast('更新失敗', 'error')
  }
}

async function handleCancel(id: number) {
  try {
    await appointmentStore.cancel(id)
    uiStore.showToast('預約已取消', 'success')
    showDetailModal.value = false
  } catch {
    uiStore.showToast('更新失敗', 'error')
  }
}

async function handleNoShow(id: number) {
  try {
    await appointmentStore.noShow(id)
    uiStore.showToast('已標記未出席', 'success')
    showDetailModal.value = false
  } catch {
    uiStore.showToast('更新失敗', 'error')
  }
}

// ── Batch Operations (list view) ────────────
const selectedIds = ref<number[]>([])

function handleToggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

async function handleBatchComplete() {
  if (selectedIds.value.length === 0) return
  try {
    await appointmentStore.batchComplete(selectedIds.value)
    uiStore.showToast(`已完成 ${selectedIds.value.length} 筆預約`, 'success')
    selectedIds.value = []
  } catch {
    uiStore.showToast('批次操作失敗', 'error')
  }
}

async function handleBatchCancel() {
  if (selectedIds.value.length === 0) return
  try {
    await appointmentStore.batchCancel(selectedIds.value)
    uiStore.showToast(`已取消 ${selectedIds.value.length} 筆預約`, 'success')
    selectedIds.value = []
  } catch {
    uiStore.showToast('批次操作失敗', 'error')
  }
}

// ── Calendar resources (therapists) ─────────
const calendarResources = computed(() => {
  const map = new Map<string, string>()
  for (const a of appointmentStore.appointments) {
    const id = String(a.therapistUserId)
    if (!map.has(id)) map.set(id, a.therapistName)
  }
  return Array.from(map, ([id, title]) => ({ id, title }))
})

// ── Init ────────────────────────────────────
onMounted(() => loadData())
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-app-text">預約管理</h1>
      <div class="flex items-center gap-2">
        <AppButton size="sm" variant="secondary" @click="openQuickBook">
          新增預約
        </AppButton>
        <div class="flex border border-gray-200 rounded-app overflow-hidden">
          <button
            class="px-3 py-1.5 text-sm"
            :class="viewMode === 'calendar' ? 'bg-primary text-white' : 'bg-white text-gray-600'"
            @click="viewMode = 'calendar'; loadData()"
          >
            日曆
          </button>
          <button
            class="px-3 py-1.5 text-sm"
            :class="viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600'"
            @click="viewMode = 'list'; loadData()"
          >
            列表
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-end gap-3 mb-4">
      <div>
        <label class="block text-xs text-gray-500 mb-1">心理師</label>
        <input
          v-model="filterTherapistId"
          type="text"
          placeholder="心理師 ID"
          class="px-3 py-1.5 border border-gray-300 rounded-app text-sm w-40"
          @change="loadData()"
        />
      </div>
      <div v-if="viewMode === 'list'">
        <label class="block text-xs text-gray-500 mb-1">狀態</label>
        <select
          v-model="filterStatus"
          class="px-3 py-1.5 border border-gray-300 rounded-app text-sm bg-white"
          @change="loadData()"
        >
          <option value="">全部</option>
          <option value="scheduled">已排定</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="no_show">未出席</option>
        </select>
      </div>
      <div v-if="viewMode === 'calendar'">
        <label class="block text-xs text-gray-500 mb-1">從</label>
        <input v-model="filterFrom" type="date" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm" @change="loadData()" />
      </div>
      <div v-if="viewMode === 'calendar'">
        <label class="block text-xs text-gray-500 mb-1">到</label>
        <input v-model="filterTo" type="date" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm" @change="loadData()" />
      </div>
    </div>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'">
      <AppointmentCalendar
        :events="appointmentStore.calendarEvents"
        :resources="calendarResources"
        @event-click="handleEventClick"
        @date-select="handleDateSelect"
      />
    </div>

    <!-- List View -->
    <div v-else>
      <!-- Batch Actions -->
      <div v-if="selectedIds.length > 0" class="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-app">
        <span class="text-sm text-blue-700">已選 {{ selectedIds.length }} 筆</span>
        <AppButton size="sm" @click="handleBatchComplete">批次完成</AppButton>
        <AppButton size="sm" variant="danger" @click="handleBatchCancel">批次取消</AppButton>
      </div>

      <AppointmentList
        :appointments="appointmentStore.appointments"
        :loading="appointmentStore.loading"
        :selectable="true"
        :selected-ids="selectedIds"
        @select="handleToggleSelect"
        @click="(apt) => { selectedAppointment = apt; showDetailModal = true }"
      />
    </div>

    <!-- Detail Modal -->
    <AppModal
      :open="showDetailModal"
      title="預約詳情"
      @close="showDetailModal = false"
    >
      <AppointmentCard
        v-if="selectedAppointment"
        :appointment="selectedAppointment"
        @complete="handleComplete"
        @cancel="handleCancel"
        @no-show="handleNoShow"
        @close="showDetailModal = false"
      />
    </AppModal>

    <!-- Quick Book Modal -->
    <QuickBookModal
      :open="showQuickBook"
      :slots="appointmentStore.availableSlots"
      @close="showQuickBook = false"
      @book="handleBook"
    />
  </div>
</template>
