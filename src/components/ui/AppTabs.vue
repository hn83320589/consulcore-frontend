<script setup lang="ts">
export interface Tab {
  key: string
  label: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div>
    <div class="flex gap-1 border-b border-gray-200 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="modelValue === tab.key
          ? 'text-primary border-primary'
          : 'text-gray-500 border-transparent hover:text-gray-700'"
        @click="$emit('update:modelValue', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
    <slot />
  </div>
</template>
