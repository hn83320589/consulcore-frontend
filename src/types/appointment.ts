import type { Schemas } from './schema'

// ── Enums（對齊契約第 6 節） ─────────────────
export type AppointmentStatus = Schemas['AppointmentResponseDto']['status']
export type SessionType = Schemas['AppointmentResponseDto']['sessionType']
export type VisitType = Schemas['AppointmentResponseDto']['visitType']
export type SeriesFrequency = Schemas['AppointmentSeriesResponseDto']['frequency']
export type SeriesStatus = Schemas['AppointmentSeriesResponseDto']['status']

// ── Appointment（對齊 AppointmentResponse） ──
export type Appointment = Schemas['AppointmentResponseDto']

export type CreateAppointmentRequest = Schemas['CreateAppointmentDto']

export type RescheduleRequest = Schemas['RescheduleDto']

/** cancel 用，可整個省略 */
export type AppointmentNoteRequest = Schemas['AppointmentNoteDto']

/** GET /appointments/list 的 query（皆選填） */
export interface AppointmentSearchParams {
  clientProfileId?: number
  therapistUserId?: number
  status?: AppointmentStatus
}

/** FullCalendar 事件格式 */
export interface CalendarEvent {
  id: string
  title: string
  start: string       // ISO datetime
  end: string
  resourceId?: string  // therapistUserId for resource view
  backgroundColor?: string
  borderColor?: string
  extendedProps: {
    appointment: Appointment
  }
}

// ── Series（常態性預約，對齊 AppointmentSeriesResponse） ──
export type AppointmentSeries = Schemas['AppointmentSeriesResponseDto']

export type CreateSeriesRequest = Schemas['CreateAppointmentSeriesDto']

export type RenewSeriesRequest = Schemas['RenewSeriesDto']
