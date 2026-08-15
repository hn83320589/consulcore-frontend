import { defineStore } from 'pinia'
import { ref } from 'vue'
import auditService from '@/services/auditService'
import type { AuditLog, AuditSearchParams, AuditExportParams } from '@/types'

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>([])
  const loading = ref(false)

  async function fetchLogs(params?: AuditSearchParams) {
    loading.value = true
    try { logs.value = await auditService.getLogs(params) }
    finally { loading.value = false }
  }

  async function exportLogs(params?: AuditExportParams) {
    return auditService.export(params)
  }

  return { logs, loading, fetchLogs, exportLogs }
})
