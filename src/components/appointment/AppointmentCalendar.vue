<script setup lang="ts">
import { ref, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core'
import type { CalendarEvent } from '@/types'

interface Resource {
  id: string
  title: string
}

interface Props {
  events: CalendarEvent[]
  resources?: Resource[]
}

const props = withDefaults(defineProps<Props>(), {
  resources: () => [],
})

const emit = defineEmits<{
  'event-click': [appointmentId: string]
  'date-select': [info: { start: string; end: string; resourceId?: string }]
}>()

const useResourceView = ref(props.resources.length > 0)

watch(
  () => props.resources,
  (r) => { useResourceView.value = r.length > 0 },
)

const calendarOptions = ref<CalendarOptions>({
  plugins: [timeGridPlugin, resourceTimeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  locale: 'zh-tw',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'resourceTimeGridWeek,timeGridWeek,timeGridDay',
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
    resourceTimeGridWeek: '心理師週曆',
  },
  eventClick(info: EventClickArg) {
    emit('event-click', info.event.id)
  },
  select(info: DateSelectArg) {
    emit('date-select', {
      start: info.startStr,
      end: info.endStr,
      resourceId: info.resource?.id,
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
        resources: resources.length > 0 ? resources : undefined,
        initialView: useResourceView ? 'resourceTimeGridWeek' : 'timeGridWeek',
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
