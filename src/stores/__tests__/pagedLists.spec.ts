import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'

// P2：稽核、收費、通知清單改為伺服器分頁，store 同時保存本頁資料與總筆數

vi.mock('@/services/auditService', () => ({ default: { getLogs: vi.fn() } }))
vi.mock('@/services/billingService', () => ({ default: { getRecords: vi.fn() } }))
vi.mock('@/services/notificationService', () => ({ default: { getNotifications: vi.fn() } }))

const { default: auditService } = await import('@/services/auditService')
const { default: billingService } = await import('@/services/billingService')
const { default: notificationService } = await import('@/services/notificationService')
const { useAuditStore } = await import('@/stores/auditStore')
const { useBillingStore } = await import('@/stores/billingStore')
const { useNotificationStore } = await import('@/stores/notificationStore')

const page = <T>(items: T[], totalCount: number | null) => ({ items, totalCount, page: 2, pageSize: 50 })

describe('分頁清單的 store', () => {
  beforeEach(() => {
    setUpTestPinia()
    vi.clearAllMocks()
  })

  it('稽核紀錄：保存本頁資料與總筆數', async () => {
    vi.mocked(auditService.getLogs).mockResolvedValue(page([{ id: 1 }], 120) as never)
    const store = useAuditStore()

    await store.fetchLogs({ page: 2, pageSize: 50 })

    expect(auditService.getLogs).toHaveBeenCalledWith({ page: 2, pageSize: 50 })
    expect(store.logs).toEqual([{ id: 1 }])
    expect(store.logsTotal).toBe(120)
  })

  it('收費紀錄：保存本頁資料與總筆數', async () => {
    vi.mocked(billingService.getRecords).mockResolvedValue(page([{ id: 5 }], 51) as never)
    const store = useBillingStore()

    await store.fetchRecords({ page: 2 })

    expect(store.records).toEqual([{ id: 5 }])
    expect(store.recordsTotal).toBe(51)
  })

  it('通知：可指定頁碼；總筆數未知時為 null', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue(page([{ id: 9 }], null) as never)
    const store = useNotificationStore()

    await store.fetchNotifications({ page: 2, pageSize: 50 })

    expect(notificationService.getNotifications).toHaveBeenCalledWith({ page: 2, pageSize: 50 })
    expect(store.notifications).toEqual([{ id: 9 }])
    expect(store.notificationsTotal).toBeNull()
  })
})
