import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import roomService from '@/services/roomService'
import scheduleService from '@/services/scheduleService'
import type {
  Room,
  CreateRoomRequest,
  UpdateRoomRequest,
  AssignTherapistToRoomRequest,
  ScheduleTemplate,
  CreateScheduleTemplateRequest,
  UpdateScheduleTemplateRequest,
  ScheduleSlot,
  ExpandScheduleRequest,
  ManualExpandRequest,
  ExpandResult,
  SlotListParams,
} from '@/types'

export const useScheduleStore = defineStore('schedule', () => {
  // ── State ──────────────────────────────────
  const rooms = ref<Room[]>([])
  const activeRoomCount = ref(0)
  const templates = ref<ScheduleTemplate[]>([])
  const slots = ref<ScheduleSlot[]>([])
  const loading = ref(false)

  // ── Derived ────────────────────────────────
  const activeRooms = computed(() => rooms.value.filter((r) => r.isActive))

  /** 以日期為 key 分組 slots */
  const slotsByDate = computed(() => {
    const map = new Map<string, ScheduleSlot[]>()
    for (const s of slots.value) {
      const existing = map.get(s.date)
      if (existing) {
        existing.push(s)
      } else {
        map.set(s.date, [s])
      }
    }
    return map
  })

  // ── Rooms ──────────────────────────────────
  async function fetchRooms() {
    rooms.value = await roomService.getRooms()
  }

  async function fetchActiveRoomCount() {
    const res = await roomService.getActiveCount()
    activeRoomCount.value = res.activeCount
  }

  async function createRoom(payload: CreateRoomRequest) {
    const created = await roomService.createRoom(payload)
    rooms.value.push(created)
    await fetchActiveRoomCount()
    return created
  }

  async function updateRoom(id: number, payload: UpdateRoomRequest) {
    const updated = await roomService.updateRoom(id, payload)
    const idx = rooms.value.findIndex((r) => r.id === id)
    if (idx !== -1) rooms.value[idx] = updated
    await fetchActiveRoomCount()
    return updated
  }

  async function deleteRoom(id: number) {
    await roomService.deleteRoom(id)
    rooms.value = rooms.value.filter((r) => r.id !== id)
    await fetchActiveRoomCount()
  }

  async function assignTherapistToRoom(id: number, payload: AssignTherapistToRoomRequest) {
    const updated = await roomService.assignTherapist(id, payload)
    const idx = rooms.value.findIndex((r) => r.id === id)
    if (idx !== -1) rooms.value[idx] = updated
    return updated
  }

  async function removeTherapistFromRoom(id: number, therapistUserId: number) {
    const updated = await roomService.removeTherapist(id, therapistUserId)
    const idx = rooms.value.findIndex((r) => r.id === id)
    if (idx !== -1) rooms.value[idx] = updated
    return updated
  }

  // ── Templates ──────────────────────────────
  async function fetchTemplates() {
    templates.value = await scheduleService.getTemplates()
  }

  async function createTemplate(payload: CreateScheduleTemplateRequest) {
    const created = await scheduleService.createTemplate(payload)
    templates.value.push(created)
    return created
  }

  async function updateTemplate(id: number, payload: UpdateScheduleTemplateRequest) {
    const updated = await scheduleService.updateTemplate(id, payload)
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx !== -1) templates.value[idx] = updated
    return updated
  }

  async function deleteTemplate(id: number) {
    await scheduleService.deleteTemplate(id)
    templates.value = templates.value.filter((t) => t.id !== id)
  }

  // ── Slots ──────────────────────────────────
  async function fetchSlots(params?: SlotListParams) {
    loading.value = true
    try {
      slots.value = await scheduleService.getSlots(params)
    } finally {
      loading.value = false
    }
  }

  async function expandSlots(payload: ExpandScheduleRequest): Promise<ExpandResult> {
    return scheduleService.expandSlots(payload)
  }

  async function manualExpand(payload: ManualExpandRequest): Promise<ExpandResult> {
    return scheduleService.manualExpand(payload)
  }

  async function blockSlot(id: number, note?: string) {
    const updated = await scheduleService.blockSlot(id, note ? { note } : undefined)
    const idx = slots.value.findIndex((s) => s.id === id)
    if (idx !== -1) slots.value[idx] = updated
    return updated
  }

  async function unblockSlot(id: number) {
    const updated = await scheduleService.unblockSlot(id)
    const idx = slots.value.findIndex((s) => s.id === id)
    if (idx !== -1) slots.value[idx] = updated
    return updated
  }

  return {
    rooms,
    activeRoomCount,
    activeRooms,
    templates,
    slots,
    slotsByDate,
    loading,
    fetchRooms,
    fetchActiveRoomCount,
    createRoom,
    updateRoom,
    deleteRoom,
    assignTherapistToRoom,
    removeTherapistFromRoom,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchSlots,
    expandSlots,
    manualExpand,
    blockSlot,
    unblockSlot,
  }
})
