<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  used: number
  remaining: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
})

const total = computed(() => props.used + props.remaining)

const percentage = computed(() =>
  total.value > 0 ? Math.round((props.used / total.value) * 100) : 0,
)

const barColor = computed(() => {
  if (props.remaining === 0) return 'bg-red-400'
  if (props.remaining <= 2) return 'bg-yellow-400'
  return 'bg-primary'
})

const textColor = computed(() => {
  if (props.remaining === 0) return 'text-red-600'
  if (props.remaining <= 2) return 'text-yellow-600'
  return 'text-gray-600'
})
</script>

<template>
  <div>
    <div v-if="label" class="flex items-center justify-between mb-1">
      <span class="text-sm text-gray-700">{{ label }}</span>
      <span class="text-xs" :class="textColor">
        {{ used }}/{{ total }} 次（剩 {{ remaining }}）
      </span>
    </div>
    <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="barColor"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
