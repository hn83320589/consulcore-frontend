<script setup lang="ts">
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core'
import type { CalendarEvent } from '@/types'
import { calendarViewForWidth } from '@/utils/calendarEvents'

// D10：原本的「心理師分欄」週曆使用付費的 resource-timegrid（未購買授權），
// 改用免費的 timegrid；要看單一心理師用頁面上的心理師篩選
interface Props {
  events: CalendarEvent[]
}

defineProps<Props>()

const emit = defineEmits<{
  'event-click': [appointmentId: string]
  'date-select': [info: { start: string; end: string }]
}>()

// 手機預設日檢視；之後只在跨過斷點時切換（例如手機轉橫向），不覆蓋使用者自己選的檢視
let viewForCurrentWidth = calendarViewForWidth(window.innerWidth)

const calendarOptions = ref<CalendarOptions>({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: viewForCurrentWidth,
  locale: 'zh-tw',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridWeek,timeGridDay',
  },
  slotMinTime: '08:00:00',
  slotMaxTime: '21:00:00',
  slotDuration: '00:30:00',
  allDaySlot: false,
  selectable: true,
  selectMirror: true,
  nowIndicator: true,
  height: 'auto',
  buttonText: {
    today: '今天',
    week: '週',
    day: '日',
  },
  windowResize({ view }) {
    const next = calendarViewForWidth(window.innerWidth)
    if (next !== viewForCurrentWidth) {
      viewForCurrentWidth = next
      view.calendar.changeView(next)
    }
  },
  eventClick(info: EventClickArg) {
    emit('event-click', info.event.id)
  },
  select(info: DateSelectArg) {
    emit('date-select', {
      start: info.startStr,
      end: info.endStr,
    })
  },
})
</script>

<template>
  <div class="appointment-calendar">
    <FullCalendar
      ref="calendarRef"
      :options="{
        ...calendarOptions,
        events: events as any[],
      }"
    />
  </div>
</template>

<style>
.appointment-calendar .fc {
  font-size: 13px;
}
.appointment-calendar .fc-toolbar-title {
  font-size: 1.1rem !important;
}
.appointment-calendar .fc-event {
  cursor: pointer;
  border-radius: var(--border-radius, 4px);
  font-size: 11px;
  padding: 1px 4px;
}
</style>
