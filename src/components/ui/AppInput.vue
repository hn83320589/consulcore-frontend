<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

// label 以 for 關聯輸入框；錯誤訊息以 aria-describedby 關聯，報讀器會一起唸出
const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      class="w-full px-3 py-2 border rounded-app text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
      :class="error ? 'border-red-400' : 'border-gray-300'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="errorId" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
