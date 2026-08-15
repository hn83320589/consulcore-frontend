/** 0=Sunday, 1=Monday, ... 6=Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface ScheduleTemplate {
  id: number
  therapistUserId: number
  therapistName: string
  dayOfWeek: number
  startTime: string  // "09:00"
  endTime: string    // "17:00"
  slotDuration: number // 分鐘
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateScheduleTemplateRequest {
  therapistUserId: number
  dayOfWeek: number   // 0–6（0=週日）
  startTime: string   // "HH:mm"
  endTime: string     // "HH:mm"
  slotDuration?: number // 分鐘，10–120，預設 50
}

export interface UpdateScheduleTemplateRequest {
  startTime?: string
  endTime?: string
  slotDuration?: number
  isActive?: boolean
}

export type SlotStatus = 'available' | 'reserved' | 'blocked' | 'cancelled'

/**
 * 對應後端契約 ScheduleSlotResponse。
 * 預約域（appointment）之後會 import 此型別作為 available-slots 回應。
 */
export interface ScheduleSlot {
  id: number
  therapistUserId: number
  therapistName: string
  roomId?: number | null
  roomName?: string | null
  date: string       // "2026-04-07"
  startTime: string  // "09:00"
  endTime: string    // "10:00"
  status: SlotStatus
  note?: string | null
}

export interface ExpandScheduleRequest {
  startDate: string // "yyyy-MM-dd"
  endDate: string   // "yyyy-MM-dd"
}

export interface ManualExpandRequest {
  year: number
  month: number
}

export interface ExpandResult {
  createdCount: number
  skippedCount: number
  warnings: string[]
}

export interface BlockSlotRequest {
  note?: string
}

export interface SlotListParams {
  startDate?: string
  endDate?: string
  therapistUserId?: number
}
