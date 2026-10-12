import httpService from './httpService'
import type { AuditLog, AuditSearchParams, AuditExportParams } from '@/types'
import { toPage, requestedPage, type Page, type PagedResponse } from '@/utils/paging'

const auditService = {
  async getLogs(params?: AuditSearchParams): Promise<Page<AuditLog>> {
    const data = await httpService.get<AuditLog[] | PagedResponse<AuditLog>>('/audit-logs', { params })
    return toPage(data, requestedPage(params))
  },
  export(params?: AuditExportParams): Promise<Blob> {
    return httpService.get<Blob>('/audit-logs/export', { params, responseType: 'blob' })
  },
}

export default auditService
