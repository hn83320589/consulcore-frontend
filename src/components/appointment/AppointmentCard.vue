<script setup lang="ts">
import type { Appointment, SessionType, VisitType } from '@/types'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatDayWithWeekday } from '@/utils/format'
import { appointmentStatusLabel, appointmentStatusVariant } from '@/utils/appointmentStatus'

interface Props {
  appointment: Appointment
}

defineProps<Props>()

const emit = defineEmits<{
  complete: [id: number]
  cancel: [id: number]
  'no-show': [id: number]
  close: []
}>()


const sessionTypeLabel: Record<SessionType, string> = {
  individual: '個別',
  couple: '伴侶',
  family: '家庭',
}

const visitTypeLabel: Record<VisitType, string> = {
  initial: '初談',
  follow_up: '後續',
}

</script>

<template>
  <div class="space-y-4">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <AppBadge :variant="appointmentStatusVariant(appointment.status)">
        {{ appointmentStatusLabel(appointment.status) }}
      </AppBadge>
      <span class="text-xs text-gray-400">#{{ appointment.id }}</span>
    </div>

    <!-- Hints（溫和提示） -->
    <div
      v-if="appointment.hints.length > 0"
      class="bg-amber-50 rounded-app p-3 text-sm text-amber-700 space-y-1"
    >
      <p v-for="(hint, i) in appointment.hints" :key="i">{{ hint }}</p>
    </div>

    <!-- Info Grid -->
    <div class="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p class="text-gray-500 text-xs">個案</p>
        <p class="font-medium">{{ appointment.clientName }}</p>
      </div>
      <div>
        <p class="text-gray-500 text-xs">心理師</p>
        <p class="font-medium">{{ appointment.therapistName }}</p>
      </div>
      <div>
        <p class="text-gray-500 text-xs">日期</p>
        <p class="font-medium">{{ formatDayWithWeekday(appointment.date) }}</p>
      </div>
      <div>
        <p class="text-gray-500 text-xs">時段</p>
        <p class="font-medium">{{ appointment.startTime }} - {{ appointment.endTime }}</p>
      </div>
      <div>
        <p class="text-gray-500 text-xs">診間</p>
        <p class="font-medium">{{ appointment.roomName ?? '—' }}</p>
      </div>
      <div>
        <p class="text-gray-500 text-xs">類型</p>
        <p class="font-medium">
          {{ sessionTypeLabel[appointment.sessionType] }} · {{ visitTypeLabel[appointment.visitType] }}
        </p>
      </div>
      <div v-if="appointment.note">
        <p class="text-gray-500 text-xs">備註</p>
        <p class="font-medium">{{ appointment.note }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
      <AppButton
        v-if="appointment.status === 'scheduled'"
        size="sm"
        @click="emit('complete', appointment.id)"
      >
        完成
      </AppButton>
      <AppButton
        v-if="appointment.status === 'scheduled'"
        size="sm" variant="danger"
        @click="emit('no-show', appointment.id)"
      >
        未出席
      </AppButton>
      <AppButton
        v-if="appointment.status === 'scheduled'"
        size="sm" variant="danger"
        @click="emit('cancel', appointment.id)"
      >
        取消
      </AppButton>
      <AppButton size="sm" variant="ghost" @click="emit('close')">
        關閉
      </AppButton>
    </div>
  </div>
</template>
