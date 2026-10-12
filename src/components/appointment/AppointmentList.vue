<script setup lang="ts">
import { computed } from 'vue'
import type { Appointment } from '@/types'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { appointmentStatusLabel, appointmentStatusVariant } from '@/utils/appointmentStatus'

interface Props {
  appointments: Appointment[]
  loading?: boolean
  selectable?: boolean
  selectedIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
  selectedIds: () => [],
})

const emit = defineEmits<{
  select: [id: number]
  click: [appointment: Appointment]
}>()

const columns: TableColumn[] = [
  ...(props.selectable ? [{ key: 'checkbox', label: '', width: '40px' }] : []),
  { key: 'date', label: '日期', width: '100px' },
  { key: 'time', label: '時段', width: '110px' },
  { key: 'clientName', label: '個案' },
  { key: 'therapistName', label: '心理師' },
  { key: 'roomName', label: '診間', width: '80px' },
  { key: 'status', label: '狀態', width: '80px' },
  { key: 'actions', label: '', width: '60px' },
]

const tableData = computed(() =>
  props.appointments,
)

</script>

<template>
  <AppTable :columns="columns" :data="tableData" :loading="loading">
    <template v-if="selectable" #cell-checkbox="{ row }">
      <input
        type="checkbox"
        :checked="selectedIds.includes(row.id)"
        class="accent-primary"
        @change="emit('select', row.id)"
      />
    </template>

    <template #cell-time="{ row }">
      {{ row.startTime }} - {{ row.endTime }}
    </template>

    <template #cell-status="{ row }">
      <AppBadge :variant="appointmentStatusVariant(row.status)">
        {{ appointmentStatusLabel(row.status) }}
      </AppBadge>
    </template>

    <template #cell-actions="{ row }">
      <AppButton size="sm" variant="ghost" @click="emit('click', row)">
        查看
      </AppButton>
    </template>
  </AppTable>
</template>
