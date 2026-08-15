export interface AuditLog {
  id: number
  userId: number
  userName?: string | null
  action: string           // "create" | "update" | "delete" | "login" | "lock" | ...
  resourceType: string     // snake_case，如 "client_profile" | "session_note" | "appointment" | ...
  resourceId: number
  description?: string | null
  changes?: string | null  // JSON 字串；view 內 JSON.parse 後做 before/after diff
  ipAddress?: string | null
  createdAt: string
}

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
