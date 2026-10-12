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
