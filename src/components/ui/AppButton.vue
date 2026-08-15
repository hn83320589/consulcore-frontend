<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})
</script>

<template>
  <button
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      // variant
      variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover',
      variant === 'secondary' && 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
      variant === 'ghost' && 'bg-transparent text-gray-600 hover:bg-gray-100',
      // size
      size === 'sm' && 'px-2.5 py-1 text-xs rounded',
      size === 'md' && 'px-4 py-2 text-sm rounded-app',
      size === 'lg' && 'px-6 py-2.5 text-base rounded-app',
    ]"
  >
    <span v-if="loading" class="mr-1.5 animate-spin">⟳</span>
    <slot />
  </button>
</template>
