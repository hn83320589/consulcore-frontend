import httpService from './httpService'
import type {
  Appointment,
  CreateAppointmentRequest,
  RescheduleRequest,
  AppointmentNoteRequest,
  AppointmentSearchParams,
  AppointmentSeries,
  CreateSeriesRequest,
  RenewSeriesRequest,
  ScheduleSlot,
} from '@/types'

interface CalendarParams {
  startDate: string
  endDate: string
  therapistUserId?: number
}

const appointmentService = {
  // ── Appointments ─────────────────────────────
  createAppointment(payload: CreateAppointmentRequest): Promise<Appointment> {
    return httpService.post<Appointment>('/appointments', payload)
  },
  complete(id: number): Promise<Appointment> {
    return httpService.post<Appointment>(`/appointments/${id}/complete`)
  },
  cancel(id: number, payload?: AppointmentNoteRequest): Promise<Appointment> {
    return httpService.post<Appointment>(`/appointments/${id}/cancel`, payload)
  },
  noShow(id: number): Promise<Appointment> {
    return httpService.post<Appointment>(`/appointments/${id}/no-show`)
  },
  reschedule(id: number, payload: RescheduleRequest): Promise<Appointment> {
    return httpService.post<Appointment>(`/appointments/${id}/reschedule`, payload)
  },

  // ── Queries ──────────────────────────────────
  getAppointment(id: number): Promise<Appointment> {
    return httpService.get<Appointment>(`/appointments/${id}`)
  },
  getCalendar(params: CalendarParams): Promise<Appointment[]> {
    return httpService.get<Appointment[]>('/appointments/calendar', { params })
  },
  getList(params?: AppointmentSearchParams): Promise<Appointment[]> {
    return httpService.get<Appointment[]>('/appointments/list', { params })
  },
  getAvailableSlots(params: CalendarParams): Promise<ScheduleSlot[]> {
    return httpService.get<ScheduleSlot[]>('/appointments/available-slots', { params })
  },

  // ── Series ───────────────────────────────────
  createSeries(payload: CreateSeriesRequest): Promise<AppointmentSeries> {
    return httpService.post<AppointmentSeries>('/appointment-series', payload)
  },
  renewSeries(id: number, payload: RenewSeriesRequest): Promise<AppointmentSeries> {
    return httpService.post<AppointmentSeries>(`/appointment-series/${id}/renew`, payload)
  },
  endSeries(id: number): Promise<AppointmentSeries> {
    return httpService.post<AppointmentSeries>(`/appointment-series/${id}/end`)
  },
  getSeriesByClient(clientProfileId: number, status?: string): Promise<AppointmentSeries[]> {
    return httpService.get<AppointmentSeries[]>(
      `/appointment-series/by-client/${clientProfileId}`,
      { params: status ? { status } : undefined },
    )
  },
  getPendingRenewals(): Promise<AppointmentSeries[]> {
    return httpService.get<AppointmentSeries[]>('/appointment-series/pending-renewal')
  },
}

export default appointmentService
