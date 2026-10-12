import type { Schemas } from './schema'

export type ConsentTriggerEvent = Schemas['ConsentTemplateResponseDto']['triggerEvent']

export type ConsentRecordStatus = Schemas['ConsentRecordResponseDto']['status']

export type ConsentTemplate = Schemas['ConsentTemplateResponseDto']

export type CreateConsentTemplateRequest = Schemas['CreateConsentTemplateDto']

export type UpdateConsentTemplateRequest = Schemas['UpdateConsentTemplateDto']

export type ConsentRecord = Schemas['ConsentRecordResponseDto']

export type SignConsentRequest = Schemas['SignConsentDto']

export type VoidConsentRequest = Schemas['VoidConsentDto']

export interface ConsentRecordSearchParams {
  clientProfileId?: number
  status?: ConsentRecordStatus
  triggerEvent?: ConsentTriggerEvent
}
