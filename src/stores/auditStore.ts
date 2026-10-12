import { defineStore } from 'pinia'
import { ref } from 'vue'
import auditService from '@/services/auditService'
import type { AuditLog, AuditSearchParams, AuditExportParams } from '@/types'

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>([])
  const logsTotal = ref(0)
  const loading = ref(false)

  async function fetchLogs(params?: AuditSearchParams) {
    loading.value = true
    try {
      const result = await auditService.getLogs(params)
      logs.value = result.items
      logsTotal.value = result.totalCount
    }
    finally { loading.value = false }
  }

  async function exportLogs(params?: AuditExportParams) {
    return auditService.export(params)
  }

  return { logs, logsTotal, loading, fetchLogs, exportLogs }
})
