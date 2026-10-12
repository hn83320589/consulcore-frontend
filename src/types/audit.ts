import type { Schemas } from './schema'

export type AuditLog = Schemas['AuditLogResponseDto']

export interface AuditSearchParams {
  action?: string
  resourceType?: string
  resourceId?: number
  userId?: number
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface AuditExportParams {
  action?: string
  resourceType?: string
  startDate?: string
  endDate?: string
  format?: 'csv' | 'pdf'
}
