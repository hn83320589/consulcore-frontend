<script setup lang="ts">
import { appointmentStatusLabel, appointmentStatuses } from '@/utils/appointmentStatus'
</script>

<template>
  <!-- 顏色與 calendarEvents 的事件相同（--color-status-*） -->
  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
    <span v-for="s in appointmentStatuses" :key="s" class="flex items-center gap-1">
      <span
        :data-status="s"
        class="w-3 h-3 rounded-sm border"
        :style="{ backgroundColor: `var(--color-status-${s})`, borderColor: `var(--color-status-${s}-border)` }"
      ></span>
      {{ appointmentStatusLabel(s) }}
    </span>
  </div>
</template>
