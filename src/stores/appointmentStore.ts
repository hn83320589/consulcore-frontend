import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import appointmentService from '@/services/appointmentService'
import type {
  Appointment,
  CreateAppointmentRequest,
  AppointmentSearchParams,
  CalendarEvent,
  AppointmentSeries,
  CreateSeriesRequest,
  RenewSeriesRequest,
  ScheduleSlot,
} from '@/types'
import type { AppointmentStatus } from '@/types'

const statusColors: Record<AppointmentStatus, { bg: string; border: string }> = {
  scheduled: { bg: '#3B82F6', border: '#2563EB' },
  completed: { bg: '#9CA3AF', border: '#6B7280' },
  cancelled: { bg: '#EF4444', border: '#DC2626' },
  no_show: { bg: '#F97316', border: '#EA580C' },
}

export const useAppointmentStore = defineStore('appointment', () => {
  // ── State ──────────────────────────────────
  const appointments = ref<Appointment[]>([])
  const availableSlots = ref<ScheduleSlot[]>([])
  const pendingRenewals = ref<AppointmentSeries[]>([])
  const clientSeries = ref<AppointmentSeries[]>([])
  const loading = ref(false)

  // ── Derived ────────────────────────────────
  const calendarEvents = computed<CalendarEvent[]>(() =>
    appointments.value.map((apt) => ({
      id: String(apt.id),
      title: `${apt.clientName} — ${apt.therapistName}`,
      start: `${apt.date}T${apt.startTime}`,
      end: `${apt.date}T${apt.endTime}`,
      resourceId: String(apt.therapistUserId),
      backgroundColor: statusColors[apt.status].bg,
      borderColor: statusColors[apt.status].border,
      extendedProps: { appointment: apt },
    })),
  )

  const upcomingAppointments = computed(() =>
    appointments.value
      .filter((a) => a.status === 'scheduled')
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
  )

  // ── Helpers ────────────────────────────────
  function replaceAppointment(updated: Appointment) {
    const idx = appointments.value.findIndex((a) => a.id === updated.id)
    if (idx !== -1) appointments.value[idx] = updated
  }

  // ── Appointments ───────────────────────────
  async function fetchAppointments(params?: AppointmentSearchParams) {
    loading.value = true
    try {
      appointments.value = await appointmentService.getList(params)
    } finally {
      loading.value = false
    }
  }

  // 單筆查詢（支援深連結）
  async function fetchAppointment(id: number) {
    return appointmentService.getAppointment(id)
  }

  async function fetchCalendar(startDate: string, endDate: string, therapistUserId?: number) {
    loading.value = true
    try {
      appointments.value = await appointmentService.getCalendar({ startDate, endDate, therapistUserId })
    } finally {
      loading.value = false
    }
  }

  async function createAppointment(payload: CreateAppointmentRequest) {
    const created = await appointmentService.createAppointment(payload)
    appointments.value.push(created)
    return created
  }

  async function complete(id: number) {
    replaceAppointment(await appointmentService.complete(id))
  }

  async function cancel(id: number, note?: string) {
    replaceAppointment(await appointmentService.cancel(id, note ? { note } : undefined))
  }

  async function noShow(id: number) {
    replaceAppointment(await appointmentService.noShow(id))
  }

  async function reschedule(id: number, newScheduleSlotId: number) {
    replaceAppointment(await appointmentService.reschedule(id, { newScheduleSlotId }))
  }

  async function batchComplete(ids: number[]) {
    const results = await Promise.all(ids.map((id) => appointmentService.complete(id)))
    results.forEach(replaceAppointment)
  }

  async function batchCancel(ids: number[]) {
    const results = await Promise.all(ids.map((id) => appointmentService.cancel(id)))
    results.forEach(replaceAppointment)
  }

  // ── Available Slots ────────────────────────
  async function fetchAvailableSlots(params: { startDate: string; endDate: string; therapistUserId?: number }) {
    availableSlots.value = await appointmentService.getAvailableSlots(params)
  }

  // ── Series ─────────────────────────────────
  async function createSeries(payload: CreateSeriesRequest) {
    return appointmentService.createSeries(payload)
  }

  async function renewSeries(id: number, payload: RenewSeriesRequest) {
    const renewed = await appointmentService.renewSeries(id, payload)
    const idx = pendingRenewals.value.findIndex((s) => s.id === id)
    if (idx !== -1) pendingRenewals.value[idx] = renewed
    return renewed
  }

  async function endSeries(id: number) {
    const ended = await appointmentService.endSeries(id)
    const idx = pendingRenewals.value.findIndex((s) => s.id === id)
    if (idx !== -1) pendingRenewals.value[idx] = ended
    return ended
  }

  async function fetchPendingRenewals() {
    pendingRenewals.value = await appointmentService.getPendingRenewals()
  }

  async function fetchSeriesByClient(clientProfileId: number, status?: string) {
    clientSeries.value = await appointmentService.getSeriesByClient(clientProfileId, status)
  }

  return {
    appointments,
    availableSlots,
    pendingRenewals,
    clientSeries,
    loading,
    calendarEvents,
    upcomingAppointments,
    fetchAppointments,
    fetchAppointment,
    fetchCalendar,
    createAppointment,
    complete,
    cancel,
    noShow,
    reschedule,
    batchComplete,
    batchCancel,
    fetchAvailableSlots,
    createSeries,
    renewSeries,
    endSeries,
    fetchPendingRenewals,
    fetchSeriesByClient,
  }
})
