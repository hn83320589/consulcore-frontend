export type ConsentTriggerEvent = 'manual' | 'first_visit' | 'annual_renewal' | 'service_change'

export type ConsentRecordStatus = 'pending' | 'signed' | 'voided'

export interface ConsentTemplate {
  id: number
  title: string
  content: string
  version: number
  triggerEvent: ConsentTriggerEvent
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateConsentTemplateRequest {
  title: string
  content: string
  triggerEvent?: ConsentTriggerEvent
}

export interface UpdateConsentTemplateRequest {
  title?: string
  content?: string
  triggerEvent?: ConsentTriggerEvent
  isActive?: boolean
}

export interface ConsentRecord {
  id: number
  consentTemplateId: number
  templateTitle: string
  clientProfileId: number
  clientName: string
  contentSnapshot: string
  templateVersion: number
  signatureImage?: string | null
  signedRemotely: boolean
  status: ConsentRecordStatus
  signedAt?: string | null
  voidedAt?: string | null
  voidReason?: string | null
  createdAt: string
}

export interface SignConsentRequest {
  consentTemplateId: number
  clientProfileId: number
  signatureImage?: string | null // Base64
  signedRemotely: boolean
}

export interface VoidConsentRequest {
  reason: string
}

export interface ConsentRecordSearchParams {
  clientProfileId?: number
  status?: ConsentRecordStatus
  triggerEvent?: ConsentTriggerEvent
}
