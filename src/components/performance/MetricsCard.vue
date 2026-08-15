<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'flat'
  variant?: 'default' | 'good' | 'warning' | 'danger'
}

withDefaults(defineProps<Props>(), {
  unit: '',
  trend: 'flat',
  variant: 'default',
})

const variantClass = {
  default: 'bg-white border-gray-200',
  good: 'bg-green-50 border-green-100',
  warning: 'bg-yellow-50 border-yellow-100',
  danger: 'bg-red-50 border-red-100',
}

const trendIcon = { up: '↑', down: '↓', flat: '→' }
const trendColor = { up: 'text-green-500', down: 'text-red-500', flat: 'text-gray-400' }
</script>

<template>
  <div class="border rounded-app p-4" :class="variantClass[variant]">
    <p class="text-xs text-gray-500 mb-1">{{ label }}</p>
    <div class="flex items-end gap-1">
      <span class="text-2xl font-bold text-gray-800">{{ value }}</span>
      <span v-if="unit" class="text-sm text-gray-400 mb-0.5">{{ unit }}</span>
      <span class="text-sm ml-auto" :class="trendColor[trend]">{{ trendIcon[trend] }}</span>
    </div>
  </div>
</template>
