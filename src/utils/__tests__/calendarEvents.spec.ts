import { describe, expect, it } from 'vitest'
import { toCalendarEvents } from '@/utils/calendarEvents'
import type { Appointment } from '@/types'

const apt = (status: Appointment['status']): Appointment => ({
  id: 7, clientName: '王小明', therapistName: '陳心理師', therapistUserId: 2,
  date: '2026-10-12', startTime: '10:00', endTime: '10:50', status,
} as Appointment)

// R16：預約轉行事曆事件（含顏色）屬於畫面邏輯，原本寫在 appointmentStore 並以 hex 寫死顏色
describe('toCalendarEvents', () => {
  it('轉成 FullCalendar 事件', () => {
    expect(toCalendarEvents([apt('scheduled')])[0]).toMatchObject({
      id: '7',
      title: '王小明 — 陳心理師',
      start: '2026-10-12T10:00',
      end: '2026-10-12T10:50',
      resourceId: '2',
    })
  })

  it.each(['scheduled', 'completed', 'cancelled', 'no_show'] as const)('狀態 %s 的顏色來自 CSS 變數', (status) => {
    const [event] = toCalendarEvents([apt(status)])

    expect(event!.backgroundColor).toBe(`var(--color-status-${status})`)
    expect(event!.borderColor).toBe(`var(--color-status-${status}-border)`)
  })
})
