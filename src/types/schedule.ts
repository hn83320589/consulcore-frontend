import type { Schemas } from './schema'

/** 0=Sunday, 1=Monday, ... 6=Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ScheduleTemplate = Schemas['ScheduleTemplateResponseDto']

export type CreateScheduleTemplateRequest = Schemas['CreateScheduleTemplateDto']

export type UpdateScheduleTemplateRequest = Schemas['UpdateScheduleTemplateDto']

export type SlotStatus = Schemas['ScheduleSlotResponseDto']['status']

/**
 * 對應後端契約 ScheduleSlotResponse。
 * 預約域（appointment）之後會 import 此型別作為 available-slots 回應。
 */
export type ScheduleSlot = Schemas['ScheduleSlotResponseDto']

export type ExpandScheduleRequest = Schemas['ExpandScheduleDto']

export type ManualExpandRequest = Schemas['ManualExpandDto']

export type ExpandResult = Schemas['ExpandResultDto']

export type BlockSlotRequest = Schemas['BlockSlotDto']

export interface SlotListParams {
  startDate?: string
  endDate?: string
  therapistUserId?: number
}
