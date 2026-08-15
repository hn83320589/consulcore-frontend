import httpService from './httpService'
import type {
  ScheduleTemplate,
  CreateScheduleTemplateRequest,
  UpdateScheduleTemplateRequest,
  ScheduleSlot,
  ExpandScheduleRequest,
  ManualExpandRequest,
  ExpandResult,
  BlockSlotRequest,
  SlotListParams,
} from '@/types'

const scheduleService = {
  // ── Templates ────────────────────────────────
  getTemplates(): Promise<ScheduleTemplate[]> {
    return httpService.get<ScheduleTemplate[]>('/schedule-templates')
  },
  getTemplate(id: number): Promise<ScheduleTemplate> {
    return httpService.get<ScheduleTemplate>(`/schedule-templates/${id}`)
  },
  createTemplate(payload: CreateScheduleTemplateRequest): Promise<ScheduleTemplate> {
    return httpService.post<ScheduleTemplate>('/schedule-templates', payload)
  },
  updateTemplate(id: number, payload: UpdateScheduleTemplateRequest): Promise<ScheduleTemplate> {
    return httpService.put<ScheduleTemplate>(`/schedule-templates/${id}`, payload)
  },
  deleteTemplate(id: number): Promise<void> {
    return httpService.delete<void>(`/schedule-templates/${id}`)
  },

  // ── Slots ────────────────────────────────────
  getSlots(params?: SlotListParams): Promise<ScheduleSlot[]> {
    return httpService.get<ScheduleSlot[]>('/schedule-slots', { params })
  },
  expandSlots(payload: ExpandScheduleRequest): Promise<ExpandResult> {
    return httpService.post<ExpandResult>('/schedule-slots/expand', payload)
  },
  manualExpand(payload: ManualExpandRequest): Promise<ExpandResult> {
    return httpService.post<ExpandResult>('/schedule-slots/manual-expand', payload)
  },
  blockSlot(id: number, payload?: BlockSlotRequest): Promise<ScheduleSlot> {
    return httpService.post<ScheduleSlot>(`/schedule-slots/${id}/block`, payload ?? {})
  },
  unblockSlot(id: number): Promise<ScheduleSlot> {
    return httpService.post<ScheduleSlot>(`/schedule-slots/${id}/unblock`)
  },
}

export default scheduleService
