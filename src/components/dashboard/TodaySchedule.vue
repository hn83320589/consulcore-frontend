<script setup lang="ts">
import AppBadge from '@/components/ui/AppBadge.vue'
import { appointmentStatusLabel, appointmentStatusVariant } from '@/utils/appointmentStatus'
import type { Appointment } from '@/types'

interface Props {
  appointments: Appointment[]
  /** 擁有者 / 行政看全機構，需要標出心理師；心理師只看自己的 */
  showTherapist?: boolean
}

withDefaults(defineProps<Props>(), { showTherapist: false })
</script>

<template>
  <div class="bg-white rounded-app border border-gray-200 p-5">
    <h2 class="text-sm font-semibold text-gray-700 mb-3">今日排程</h2>
    <div v-if="appointments.length === 0" class="text-sm text-gray-400 py-4 text-center">
      今日尚無預約
    </div>
    <ul v-else class="divide-y divide-gray-100">
      <li
        v-for="a in appointments"
        :key="a.id"
        class="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm"
      >
        <span class="font-medium text-app-text w-28 shrink-0">{{ a.startTime }} - {{ a.endTime }}</span>
        <span class="text-gray-700 min-w-[4rem]">{{ a.clientName }}</span>
        <span v-if="showTherapist" class="text-gray-500 min-w-[4rem]">{{ a.therapistName }}</span>
        <span class="text-gray-400 flex-1">{{ a.roomName ?? '—' }}</span>
        <AppBadge :variant="appointmentStatusVariant(a.status)">{{ appointmentStatusLabel(a.status) }}</AppBadge>
      </li>
    </ul>
  </div>
</template>
