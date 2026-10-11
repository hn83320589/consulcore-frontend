<script setup lang="ts">
import { computed } from 'vue'
import type { Appointment, AppointmentStatus } from '@/types'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'

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

const statusLabel: Record<AppointmentStatus, string> = {
  scheduled: '已排定',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '未出席',
}

const statusVariant: Record<AppointmentStatus, 'info' | 'success' | 'default' | 'danger' | 'warning'> = {
  scheduled: 'info',
  completed: 'default',
  cancelled: 'danger',
  no_show: 'warning',
}
</script>

<template>
  <AppTable :columns="columns" :data="tableData" :loading="loading">
    <template v-if="selectable" #cell-checkbox="{ row }">
      <input
        type="checkbox"
        :checked="selectedIds.includes(row.id)"
        class="accent-[var(--color-primary)]"
        @change="emit('select', row.id)"
      />
    </template>

    <template #cell-time="{ row }">
      {{ row.startTime }} - {{ row.endTime }}
    </template>

    <template #cell-status="{ row }">
      <AppBadge :variant="statusVariant[row.status]">
        {{ statusLabel[row.status] }}
      </AppBadge>
    </template>

    <template #cell-actions="{ row }">
      <AppButton size="sm" variant="ghost" @click="emit('click', row)">
        查看
      </AppButton>
    </template>
  </AppTable>
</template>
