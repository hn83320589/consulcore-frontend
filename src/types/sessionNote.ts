export type SessionNoteFormat = 'soap' | 'free_text'
export type SessionNoteType = 'session' | 'closure'

export interface SessionNote {
  id: number
  clientProfileId: number
  clientName: string
  therapistUserId: number
  therapistName: string
  appointmentId?: number | null
  type: SessionNoteType
  format: SessionNoteFormat
  soapS?: string | null
  soapO?: string | null
  soapA?: string | null
  soapP?: string | null
  freeTextContent?: string | null
  intakeSummaryImported: boolean
  isLocked: boolean
  lockedAt?: string | null
  lockedBy?: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateSessionNoteRequest {
  clientProfileId: number
  appointmentId?: number | null
  type?: SessionNoteType
  format?: SessionNoteFormat
  soapS?: string | null
  soapO?: string | null
  soapA?: string | null
  soapP?: string | null
  freeTextContent?: string | null
}

export interface UpdateSessionNoteRequest {
  soapS?: string | null
  soapO?: string | null
  soapA?: string | null
  soapP?: string | null
  freeTextContent?: string | null
}
