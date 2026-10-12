import httpService from './httpService'
import type { AuditSearchParams, AuditExportParams } from '@/types'
import type { Schemas } from '@/types/schema'

const auditService = {
  getLogs(params?: AuditSearchParams): Promise<Schemas['AuditLogResponseDtoPagedResult']> {
    return httpService.get<Schemas['AuditLogResponseDtoPagedResult']>('/audit-logs', { params })
  },
  export(params?: AuditExportParams): Promise<Blob> {
    return httpService.get<Blob>('/audit-logs/export', { params, responseType: 'blob' })
  },
}

export default auditService
