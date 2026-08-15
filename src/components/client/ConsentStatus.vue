<script setup lang="ts">
import type { ConsentRecord, ConsentRecordStatus } from '@/types'
import AppBadge from '@/components/ui/AppBadge.vue'

interface Props {
  records: ConsentRecord[]
}

defineProps<Props>()

defineEmits<{
  view: [record: ConsentRecord]
}>()

const statusLabels: Record<ConsentRecordStatus, string> = {
  pending: '待簽署',
  signed: '有效',
  voided: '已作廢',
}

const statusVariants: Record<ConsentRecordStatus, 'success' | 'danger' | 'default'> = {
  pending: 'default',
  signed: 'success',
  voided: 'danger',
}

function formatDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleDateString('zh-TW') : '—'
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-app p-6">
    <h3 class="font-semibold text-gray-800 mb-4">同意書簽署狀態</h3>

    <div v-if="records.length === 0" class="text-sm text-gray-400">
      尚未簽署任何同意書
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="rec in records"
        :key="rec.id"
        class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
      >
        <div>
          <p class="text-sm font-medium text-gray-700">{{ rec.templateTitle }}</p>
          <p class="text-xs text-gray-400">
            v{{ rec.templateVersion }} · {{ formatDate(rec.signedAt) }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <AppBadge :variant="statusVariants[rec.status]">
            {{ statusLabels[rec.status] }}
          </AppBadge>
          <button
            class="text-xs text-primary hover:underline"
            @click="$emit('view', rec)"
          >
            查看
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
