import type { Appointment, CalendarEvent } from '@/types'

/**
 * 預約轉成 FullCalendar 事件。顏色取自 CSS 變數 --color-status-*（styles/variables.css），
 * FullCalendar 會寫進 inline style，var(...) 可直接生效。
 */
export function toCalendarEvents(appointments: Appointment[]): CalendarEvent[] {
  return appointments.map((apt) => ({
    id: String(apt.id),
    title: `${apt.clientName} — ${apt.therapistName}`,
    start: `${apt.date}T${apt.startTime}`,
    end: `${apt.date}T${apt.endTime}`,
    resourceId: String(apt.therapistUserId),
    backgroundColor: `var(--color-status-${apt.status})`,
    borderColor: `var(--color-status-${apt.status}-border)`,
    extendedProps: { appointment: apt },
  }))
}
