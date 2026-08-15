// ── Enums（對齊契約第 6 節） ─────────────────
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type SessionType = 'individual' | 'couple' | 'family'
export type VisitType = 'initial' | 'follow_up'
export type SeriesFrequency = 'weekly' | 'biweekly'
export type SeriesStatus = 'active' | 'pending_confirmation' | 'ended'

// ── Appointment（對齊 AppointmentResponse） ──
export interface Appointment {
  id: number
  clientProfileId: number
  clientName: string
  therapistUserId: number
  therapistName: string
  roomId?: number | null
  roomName?: string | null
  scheduleSlotId: number
  date: string         // "2026-04-07"
  startTime: string    // "09:00"
  endTime: string      // "10:00"
  seriesId?: number | null
  sessionType: SessionType
  visitType: VisitType
  status: AppointmentStatus
  note?: string | null
  hints: string[]      // 溫和提示（BR-06），空陣列代表無提示
  createdAt: string
}

export interface CreateAppointmentRequest {
  clientProfileId: number
  scheduleSlotId: number
  sessionType?: SessionType
  visitType?: VisitType
  note?: string | null
}

export interface RescheduleRequest {
  newScheduleSlotId: number
}

/** cancel 用，可整個省略 */
export interface AppointmentNoteRequest {
  note?: string | null
}

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
export interface AppointmentSeries {
  id: number
  clientProfileId: number
  clientName: string
  therapistUserId: number
  therapistName: string
  dayOfWeek: number
  startTime: string
  frequency: SeriesFrequency
  status: SeriesStatus
  expiresAt: string
  totalAppointments: number
  remainingAppointments: number
  createdAt: string
}

export interface CreateSeriesRequest {
  clientProfileId: number
  therapistUserId: number
  dayOfWeek: number
  startTime: string           // "HH:mm"
  frequency?: SeriesFrequency
  months?: number             // 1–3（BR-07 上限 3 個月）
}

export interface RenewSeriesRequest {
  months?: number             // 1–3
}
