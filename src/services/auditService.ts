import httpService from './httpService'
import type { AuditLog, AuditSearchParams, AuditExportParams } from '@/types'

const auditService = {
  getLogs(params?: AuditSearchParams): Promise<AuditLog[]> {
    return httpService.get<AuditLog[]>('/audit-logs', { params })
  },
  export(params?: AuditExportParams): Promise<Blob> {
    return httpService.get<Blob>('/audit-logs/export', { params, responseType: 'blob' })
  },
}

export default auditService
