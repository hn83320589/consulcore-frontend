<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useStaffStore } from '@/stores/staffStore'
import { useUiStore } from '@/stores/uiStore'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { notifyError } from '@/utils/notifyError'
import type { Room, CreateRoomRequest, UpdateRoomRequest } from '@/types'

const scheduleStore = useScheduleStore()
const staffStore = useStaffStore()
const uiStore = useUiStore()

const columns: TableColumn[] = [
  { key: 'name', label: '名稱' },
  { key: 'therapists', label: '指派心理師' },
  { key: 'isActive', label: '狀態', width: '80px' },
  { key: 'actions', label: '操作', width: '180px' },
]

const tableData = computed(() =>
  scheduleStore.rooms,
)

function therapistNames(room: Room): string {
  if (room.therapists.length === 0) return '—'
  return room.therapists.map((t) => t.therapistName).join('、')
}

// ── Modal ───────────────────────────────────
const showModal = ref(false)
const editingRoom = ref<Room | null>(null)
const saving = ref(false)
const form = ref({ name: '' })

const isEdit = computed(() => !!editingRoom.value)

function openCreate() {
  editingRoom.value = null
  form.value = { name: '' }
  showModal.value = true
}

function openEdit(room: Room) {
  editingRoom.value = room
  form.value = { name: room.name }
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value && editingRoom.value) {
      const payload: UpdateRoomRequest = { name: form.value.name }
      await scheduleStore.updateRoom(editingRoom.value.id, payload)
      uiStore.showToast('診間已更新', 'success')
    } else {
      const payload: CreateRoomRequest = { name: form.value.name }
      await scheduleStore.createRoom(payload)
      uiStore.showToast('診間已新增', 'success')
    }
    showModal.value = false
  } catch (e) {
    notifyError(e, '操作失敗')
  } finally {
    saving.value = false
  }
}

// ── 心理師指派 ──────────────────────────────
const selectedTherapistId = ref('')

// 可指派名單：啟用中的心理師，排除已指派者
const therapistOptions = computed(() => {
  const assigned = new Set(editingRoom.value?.therapists.map((t) => t.therapistUserId) ?? [])
  return staffStore.users
    .filter((u) => u.isActive && u.roles.includes('therapist') && !assigned.has(u.id))
    .map((u) => ({ value: String(u.id), label: u.displayName }))
})

function syncEditingRoom() {
  if (!editingRoom.value) return
  const fresh = scheduleStore.rooms.find((r) => r.id === editingRoom.value!.id)
  if (fresh) editingRoom.value = fresh
}

async function handleAssignTherapist() {
  if (!editingRoom.value || !selectedTherapistId.value) return
  try {
    await scheduleStore.assignTherapistToRoom(editingRoom.value.id, {
      therapistUserId: Number(selectedTherapistId.value),
    })
    syncEditingRoom()
    selectedTherapistId.value = ''
    uiStore.showToast('已指派心理師', 'success')
  } catch (e) {
    notifyError(e, '指派失敗')
  }
}

async function handleRemoveTherapist(therapistUserId: number) {
  if (!editingRoom.value) return
  try {
    await scheduleStore.removeTherapistFromRoom(editingRoom.value.id, therapistUserId)
    syncEditingRoom()
    uiStore.showToast('已移除指派', 'success')
  } catch (e) {
    notifyError(e, '移除失敗')
  }
}

async function handleToggle(room: Room) {
  const action = room.isActive ? '停用' : '啟用'
  try {
    // 契約無獨立 status 端點，停用/啟用改走 PUT /rooms/{id} 帶 isActive
    await scheduleStore.updateRoom(room.id, { isActive: !room.isActive })
    uiStore.showToast(`已${action} ${room.name}`, 'success')
  } catch (e) {
    notifyError(e, `${action}失敗`)
  }
}

onMounted(async () => {
  await Promise.all([
    scheduleStore.fetchRooms(),
    scheduleStore.fetchActiveRoomCount(),
    staffStore.fetchUsers(),
  ])
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-app-text">診間設定</h1>
        <p class="text-sm text-gray-500 mt-1">
          最大同時段諮商數：<span class="font-semibold text-primary">{{ scheduleStore.activeRoomCount }}</span>
        </p>
      </div>
      <AppButton @click="openCreate">新增診間</AppButton>
    </div>

    <AppTable :columns="columns" :data="tableData">
      <template #cell-therapists="{ row }">
        {{ therapistNames(row) }}
      </template>

      <template #cell-isActive="{ row }">
        <AppBadge :variant="row.isActive ? 'success' : 'danger'">
          {{ row.isActive ? '啟用' : '停用' }}
        </AppBadge>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex gap-1">
          <AppButton size="sm" variant="ghost" @click="openEdit(row)">
            編輯
          </AppButton>
          <AppButton
            size="sm"
            :variant="row.isActive ? 'danger' : 'secondary'"
            @click="handleToggle(row)"
          >
            {{ row.isActive ? '停用' : '啟用' }}
          </AppButton>
        </div>
      </template>
    </AppTable>

    <!-- Modal -->
    <AppModal :open="showModal" :title="isEdit ? '編輯診間' : '新增診間'" @close="showModal = false">
      <form class="space-y-4" @submit.prevent="handleSave">
        <AppInput v-model="form.name" label="名稱" placeholder="例如：A 診間" />

        <!-- 心理師指派（僅編輯既有診間時） -->
        <div v-if="isEdit && editingRoom" class="border-t border-gray-100 pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">指派心理師</label>

          <div v-if="editingRoom.therapists.length > 0" class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="t in editingRoom.therapists"
              :key="t.therapistUserId"
              class="inline-flex items-center gap-1.5 bg-blue-50 text-primary text-sm rounded-app px-2.5 py-1"
            >
              {{ t.therapistName }}
              <button
                type="button"
                class="text-primary/60 hover:text-primary"
                @click="handleRemoveTherapist(t.therapistUserId)"
              >
                ✕
              </button>
            </span>
          </div>

          <div class="flex gap-2">
            <AppSelect
              v-model="selectedTherapistId"
              :options="therapistOptions"
              placeholder="選擇心理師"
              class="flex-1"
            />
            <AppButton
              type="button"
              size="sm"
              variant="secondary"
              :disabled="!selectedTherapistId"
              @click="handleAssignTherapist"
            >
              指派
            </AppButton>
          </div>
        </div>
      </form>

      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">取消</AppButton>
        <AppButton :loading="saving" :disabled="!form.name" @click="handleSave">
          {{ isEdit ? '儲存' : '新增' }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>
