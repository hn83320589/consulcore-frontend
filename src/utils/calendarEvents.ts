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
    backgroundColor: `var(--color-status-${apt.status})`,
    borderColor: `var(--color-status-${apt.status}-border)`,
    extendedProps: { appointment: apt },
  }))
}

/** 與 Tailwind md 斷點相同：窄於此寬度時 7 天週檢視放不下 */
const WEEK_VIEW_MIN_WIDTH = 768

export type CalendarView = 'timeGridDay' | 'timeGridWeek'

/** 依視窗寬度決定預設檢視：手機用日檢視，平板以上用週檢視 */
export function calendarViewForWidth(width: number): CalendarView {
  return width < WEEK_VIEW_MIN_WIDTH ? 'timeGridDay' : 'timeGridWeek'
}
