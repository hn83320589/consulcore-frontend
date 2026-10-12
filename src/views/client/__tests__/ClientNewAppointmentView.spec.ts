import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'

// 提示「建議維持固定心理師」，卻沒有標出是哪一位
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/services/appointmentService', () => ({
  default: { getAvailableSlots: vi.fn(), getList: vi.fn() },
}))

const { default: appointmentService } = await import('@/services/appointmentService')
const { useAuthStore } = await import('@/stores/authStore')
const { default: ClientNewAppointmentView } = await import('@/views/client/ClientNewAppointmentView.vue')

describe('ClientNewAppointmentView 選心理師', () => {
  it('最近預約的心理師排在第一位並標示', async () => {
    setUpTestPinia()
    useAuthStore().clientProfileId = 5
    vi.mocked(appointmentService.getAvailableSlots).mockResolvedValue([
      { id: 1, therapistUserId: 2, therapistName: '林志豪' },
      { id: 2, therapistUserId: 3, therapistName: '陳怡君' },
    ] as never)
    vi.mocked(appointmentService.getList).mockResolvedValue([
      { id: 9, date: '2026-01-05', startTime: '10:00', therapistUserId: 3, status: 'completed' },
    ] as never)

    const wrapper = mount(ClientNewAppointmentView)
    await flushPromises()

    const cards = wrapper.findAll('button').filter((b) => b.text().includes('心理師') || b.text().includes('林志豪') || b.text().includes('陳怡君'))
    expect(cards[0]!.text()).toContain('陳怡君')
    expect(cards[0]!.text()).toContain('最近預約')
    expect(cards[1]!.text()).not.toContain('最近預約')
    expect(appointmentService.getList).toHaveBeenCalledWith({ clientProfileId: 5 })
  })
})
