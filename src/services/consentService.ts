import httpService from './httpService'
import type {
  ConsentTemplate,
  ConsentTriggerEvent,
  CreateConsentTemplateRequest,
  UpdateConsentTemplateRequest,
  ConsentRecord,
  ConsentRecordSearchParams,
  SignConsentRequest,
  VoidConsentRequest,
} from '@/types'

const consentService = {
  // ── Templates ────────────────────────────────
  getTemplates(): Promise<ConsentTemplate[]> {
    return httpService.get<ConsentTemplate[]>('/consent-templates')
  },
  getTemplate(id: number): Promise<ConsentTemplate> {
    return httpService.get<ConsentTemplate>(`/consent-templates/${id}`)
  },
  createTemplate(payload: CreateConsentTemplateRequest): Promise<ConsentTemplate> {
    return httpService.post<ConsentTemplate>('/consent-templates', payload)
  },
  updateTemplate(id: number, payload: UpdateConsentTemplateRequest): Promise<ConsentTemplate> {
    return httpService.put<ConsentTemplate>(`/consent-templates/${id}`, payload)
  },
  deleteTemplate(id: number): Promise<void> {
    return httpService.delete<void>(`/consent-templates/${id}`)
  },

  // ── Records ──────────────────────────────────
  getRecords(params?: ConsentRecordSearchParams): Promise<ConsentRecord[]> {
    return httpService.get<ConsentRecord[]>('/consent-records', { params })
  },
  getRecordsByClient(clientProfileId: number): Promise<ConsentRecord[]> {
    return httpService.get<ConsentRecord[]>(`/consent-records/by-client/${clientProfileId}`)
  },
  getRecordsByTriggerEvent(triggerEvent: ConsentTriggerEvent): Promise<ConsentRecord[]> {
    return httpService.get<ConsentRecord[]>(`/consent-records/by-trigger-event/${triggerEvent}`)
  },
  signConsent(payload: SignConsentRequest): Promise<ConsentRecord> {
    return httpService.post<ConsentRecord>('/consent-records/sign', payload)
  },
  voidRecord(id: number, payload: VoidConsentRequest): Promise<ConsentRecord> {
    return httpService.post<ConsentRecord>(`/consent-records/${id}/void`, payload)
  },
}

export default consentService
