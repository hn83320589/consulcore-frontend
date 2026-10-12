import { describe, expect, it } from 'vitest'
import { appointmentStatusLabel, appointmentStatuses, recentTherapistId, todaysAppointments } from '@/utils/appointmentStatus'
import type { Appointment } from '@/types'

const apt = (id: number, date: string, startTime: string, status: Appointment['status']) =>
  ({ id, date, startTime, endTime: '', status }) as Appointment

// 心理師儀表板的「今日預約」原本只算已排定：今天已完成的晤談不算，排程顯示「今日尚無預約」
describe('todaysAppointments', () => {
  it('列出當天未取消的預約（含已完成、未出席），依時間排序', () => {
    const list = [
      apt(1, '2026-10-12', '15:40', 'completed'),
      apt(2, '2026-10-12', '09:00', 'scheduled'),
      apt(3, '2026-10-12', '10:40', 'cancelled'),
      apt(4, '2026-10-12', '11:30', 'no_show'),
      apt(5, '2026-10-13', '09:00', 'scheduled'),
    ]

    expect(todaysAppointments(list, '2026-10-12').map((a) => a.id)).toEqual([2, 4, 1])
  })
})

describe('appointmentStatus', () => {
  it('每個狀態都有中文名稱（行事曆圖例依此列出）', () => {
    expect(appointmentStatuses.map(appointmentStatusLabel)).toEqual(['已排定', '已完成', '已取消', '未出席'])
  })
})

// 個案預約頁提示「建議維持固定心理師」，卻沒標出是哪一位
describe('recentTherapistId', () => {
  const a = (date: string, therapistUserId: number, status: Appointment['status'] = 'completed') =>
    ({ date, startTime: '10:00', therapistUserId, status }) as Appointment

  it('取今天以前最近一次未取消預約的心理師', () => {
    const list = [a('2026-09-01', 2), a('2026-10-05', 3), a('2026-10-10', 4, 'cancelled'), a('2026-10-20', 5, 'scheduled')]

    expect(recentTherapistId(list, '2026-10-12')).toBe(3)
  })

  it('沒有過去的預約時，取最近一筆即將到來的', () => {
    expect(recentTherapistId([a('2026-10-28', 6, 'scheduled'), a('2026-10-14', 7, 'scheduled')], '2026-10-12')).toBe(7)
  })

  it('沒有預約時回傳 null', () => {
    expect(recentTherapistId([], '2026-10-12')).toBeNull()
  })
})
