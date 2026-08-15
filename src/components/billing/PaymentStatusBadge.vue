<script setup lang="ts">
import AppBadge from '@/components/ui/AppBadge.vue'
import type { PaymentStatus } from '@/types'

interface Props {
  status: PaymentStatus
}

defineProps<Props>()

const statusConfig: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  paid: { label: '已收', variant: 'success' },
  pending: { label: '待收', variant: 'warning' },
  refunded: { label: '退費', variant: 'danger' },
  waived: { label: '免收', variant: 'default' },
}
</script>

<template>
  <AppBadge :variant="statusConfig[status].variant">
    {{ statusConfig[status].label }}
  </AppBadge>
</template>
