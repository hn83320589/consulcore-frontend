import type { Appointment, AppointmentStatus } from '@/types'

export const appointmentStatuses: AppointmentStatus[] = ['scheduled', 'completed', 'cancelled', 'no_show']

const labels: Record<AppointmentStatus, string> = {
  scheduled: '已排定',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '未出席',
}

export type BadgeVariant = 'info' | 'success' | 'default' | 'danger' | 'warning'

const variants: Record<AppointmentStatus, BadgeVariant> = {
  scheduled: 'info',
  completed: 'default',
  cancelled: 'danger',
  no_show: 'warning',
}

export function appointmentStatusLabel(status: AppointmentStatus): string {
  return labels[status]
}

export function appointmentStatusVariant(status: AppointmentStatus): BadgeVariant {
  return variants[status]
}

/** 當天的排程：已取消的不算，已完成、未出席仍列出，依開始時間排序 */
export function todaysAppointments(appointments: readonly Appointment[], today: string): Appointment[] {
  return appointments
    .filter((a) => a.date === today && a.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * 個案最近一次預約的心理師：優先取今天以前最近一次未取消的，沒有則取最近一筆即將到來的。
 * 個案端沒有讀取指派關係的權限，以預約紀錄推算。
 */
export function recentTherapistId(appointments: readonly Appointment[], today: string): number | null {
  const key = (a: Appointment) => `${a.date} ${a.startTime}`
  const active = appointments.filter((a) => a.status !== 'cancelled')
  const past = active.filter((a) => a.date <= today).sort((a, b) => key(b).localeCompare(key(a)))
  const upcoming = active.filter((a) => a.date > today).sort((a, b) => key(a).localeCompare(key(b)))
  return (past[0] ?? upcoming[0])?.therapistUserId ?? null
}
