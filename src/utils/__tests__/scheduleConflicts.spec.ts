import { describe, expect, it } from 'vitest'
import { detectRoomConflicts } from '@/utils/scheduleConflicts'
import type { ScheduleSlot } from '@/types'

let nextId = 1
function slot(therapistName: string, startTime: string, endTime: string, roomId: number | null = 1, date = '2026-10-12'): ScheduleSlot {
  return {
    id: nextId++, therapistUserId: nextId, therapistName, roomId, roomName: roomId ? `診間${roomId}` : null,
    date, startTime, endTime, status: 'available',
  } as ScheduleSlot
}

// F9：原本只比對「同日、同診間、同一開始時間」，部分重疊的時段抓不到
describe('detectRoomConflicts', () => {
  it('同一開始時間視為衝突', () => {
    const conflicts = detectRoomConflicts([slot('陳', '10:00', '11:00'), slot('林', '10:00', '11:00')])

    expect(conflicts).toEqual([{ date: '2026-10-12', time: '10:00–11:00', roomName: '診間1', therapists: ['陳', '林'] }])
  })

  it('部分重疊也是衝突', () => {
    const conflicts = detectRoomConflicts([slot('陳', '10:00', '11:00'), slot('林', '10:30', '11:30')])

    expect(conflicts).toEqual([{ date: '2026-10-12', time: '10:00–11:30', roomName: '診間1', therapists: ['陳', '林'] }])
  })

  it('前後銜接（一個結束時另一個開始）不是衝突', () => {
    expect(detectRoomConflicts([slot('陳', '10:00', '11:00'), slot('林', '11:00', '12:00')])).toEqual([])
  })

  it('不同診間或不同日期不衝突；未指派診間不納入', () => {
    expect(detectRoomConflicts([
      slot('陳', '10:00', '11:00', 1),
      slot('林', '10:00', '11:00', 2),
      slot('王', '10:00', '11:00', 1, '2026-10-13'),
      slot('張', '10:00', '11:00', null),
    ])).toEqual([])
  })

  it('連鎖重疊的時段合併成一組', () => {
    const conflicts = detectRoomConflicts([
      slot('陳', '09:00', '10:00'),
      slot('林', '09:30', '10:30'),
      slot('王', '10:15', '11:00'),
    ])

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ time: '09:00–11:00', therapists: ['陳', '林', '王'] })
  })
})
