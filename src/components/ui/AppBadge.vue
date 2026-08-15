<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
    :class="{
      'bg-gray-100 text-gray-700': variant === 'default',
      'bg-green-100 text-green-700': variant === 'success',
      'bg-yellow-100 text-yellow-700': variant === 'warning',
      'bg-red-100 text-red-700': variant === 'danger',
      'bg-blue-100 text-blue-700': variant === 'info',
    }"
  >
    <slot />
  </span>
</template>
