import type { ScheduleSlot } from '@/types'

export interface RoomConflict {
  date: string
  time: string // 衝突區間，例如 "10:00–11:30"
  roomName: string
  therapists: string[]
}

/**
 * 找出同一天、同一診間時段互相重疊的排班。
 * 以區間判斷（A 開始 < B 結束 且 B 開始 < A 結束），前後銜接不算衝突；
 * 連鎖重疊的時段合併為一組。未指派診間的時段不納入。
 * 時間為同日的 "HH:mm" 字串，可直接比較大小。
 */
export function detectRoomConflicts(slots: ScheduleSlot[]): RoomConflict[] {
  const byDateRoom = new Map<string, ScheduleSlot[]>()
  for (const slot of slots) {
    if (slot.roomId == null) continue
    const key = `${slot.date}|${slot.roomId}`
    byDateRoom.set(key, [...(byDateRoom.get(key) ?? []), slot])
  }

  const conflicts: RoomConflict[] = []
  for (const group of byDateRoom.values()) {
    const sorted = [...group].sort((a, b) => a.startTime.localeCompare(b.startTime))
    let cluster: ScheduleSlot[] = []
    let clusterEnd = ''

    const flush = () => {
      if (cluster.length > 1) {
        const first = cluster[0]!
        conflicts.push({
          date: first.date,
          time: `${first.startTime}–${clusterEnd}`,
          roomName: first.roomName ?? '未指定診間',
          therapists: cluster.map((s) => s.therapistName),
        })
      }
    }

    for (const slot of sorted) {
      if (cluster.length > 0 && slot.startTime < clusterEnd) {
        cluster.push(slot)
        if (slot.endTime > clusterEnd) clusterEnd = slot.endTime
      } else {
        flush()
        cluster = [slot]
        clusterEnd = slot.endTime
      }
    }
    flush()
  }
  return conflicts
}
