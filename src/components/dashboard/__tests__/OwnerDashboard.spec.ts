import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import { toLocalDateString } from '@/utils/date'

// 擁有者儀表板原本只有 4 張數字卡，看不到今天的排程與待收款
vi.mock('vue-router', () => ({ RouterLink: { template: '<a><slot /></a>' } }))
vi.mock('@/services/appointmentService', () => ({
  default: {
    getCalendar: vi.fn(),
    getPendingRenewals: vi.fn().mockResolvedValue([]),
  },
}))
vi.mock('@/services/billingService', () => ({ default: { getPending: vi.fn() } }))
vi.mock('@/services/reportService', () => ({ default: { getMonthlyRevenue: vi.fn().mockResolvedValue({ totalRevenue: 0 }) } }))
vi.mock('@/services/clientService', () => ({ default: { getClients: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) } }))

const { default: appointmentService } = await import('@/services/appointmentService')
const { default: billingService } = await import('@/services/billingService')
const { default: OwnerDashboard } = await import('@/components/dashboard/OwnerDashboard.vue')

describe('OwnerDashboard', () => {
  it('顯示今日排程（含心理師）與待收款清單', async () => {
    setUpTestPinia()
    const today = toLocalDateString(new Date())
    vi.mocked(appointmentService.getCalendar).mockResolvedValue([
      { id: 1, date: today, startTime: '09:00', endTime: '09:50', clientName: '李品妤', therapistName: '陳怡君', status: 'scheduled' },
    ] as never)
    vi.mocked(billingService.getPending).mockResolvedValue([
      { id: 9, clientName: '吳承翰', finalAmount: 2500, status: 'pending', createdAt: '2026-10-12T06:00:00Z' },
    ] as never)

    const wrapper = mount(OwnerDashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('今日排程')
    expect(wrapper.text()).toContain('陳怡君')
    expect(wrapper.text()).toContain('待收款')
    expect(wrapper.text()).toContain('吳承翰')
    expect(wrapper.text()).toContain('$2,500')
  })
})
