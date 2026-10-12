<script setup lang="ts">
import { computed } from 'vue'
import { toLocalDateString } from '@/utils/date'
import type { ScheduleSlot, SlotStatus } from '@/types'

interface Props {
  year: number
  month: number // 1-12
  slotsByDate: Map<string, ScheduleSlot[]>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'slot-click': [slot: ScheduleSlot]
}>()

const today = toLocalDateString(new Date())

const statusColors: Record<SlotStatus, string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  reserved: 'bg-blue-100 text-blue-700 border-blue-200',
  blocked: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-red-50 text-red-400 border-red-200 line-through',
}

const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

// ── Calendar grid ───────────────────────────
const calendarDays = computed(() => {
  const firstDay = new Date(props.year, props.month - 1, 1)
  const lastDay = new Date(props.year, props.month, 0)
  const startDow = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const cells: ({ date: string; day: number; isPast: boolean } | null)[] = []

  // Leading empty cells
  for (let i = 0; i < startDow; i++) cells.push(null)

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${props.year}-${String(props.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      date: dateStr,
      day: d,
      isPast: dateStr < today,
    })
  }

  return cells
})

function getSlotsForDate(date: string): ScheduleSlot[] {
  return props.slotsByDate.get(date) ?? []
}

function handleSlotClick(slot: ScheduleSlot, isPast: boolean) {
  if (isPast) return
  emit('slot-click', slot)
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-app overflow-hidden">
    <!-- Day headers -->
    <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
      <div
        v-for="label in dayLabels"
        :key="label"
        class="px-2 py-2 text-center text-xs font-medium text-gray-500"
      >
        {{ label }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7">
      <div
        v-for="(cell, idx) in calendarDays"
        :key="idx"
        class="min-h-[100px] border-b border-r border-gray-100 p-1.5"
        :class="cell?.isPast ? 'bg-gray-50/50' : ''"
      >
        <template v-if="cell">
          <p class="text-xs font-medium mb-1" :class="cell.isPast ? 'text-gray-300' : 'text-gray-600'">
            {{ cell.day }}
          </p>
          <div class="space-y-0.5">
            <template v-for="(slot, sIdx) in getSlotsForDate(cell.date)" :key="slot.id">
              <button
                v-if="sIdx < 3"
                class="w-full text-left px-1 py-0.5 rounded-sm text-[10px] border truncate"
                :class="[
                  statusColors[slot.status],
                  cell.isPast ? 'opacity-50 cursor-default' : 'cursor-pointer hover:opacity-80',
                ]"
                :title="`${slot.startTime}-${slot.endTime} ${slot.therapistName} (${slot.roomName ?? '未指定診間'})`"
                @click="handleSlotClick(slot, cell.isPast)"
              >
                {{ slot.startTime }} {{ slot.therapistName }}
              </button>
            </template>
            <p
              v-if="getSlotsForDate(cell.date).length > 3"
              class="text-[10px] text-gray-400 pl-1"
            >
              +{{ getSlotsForDate(cell.date).length - 3 }} 個
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
