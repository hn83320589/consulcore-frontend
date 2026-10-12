<script setup lang="ts">
import { ref } from 'vue'
import type { PhraseCategory } from '@/types'

type SoapField = 'soapS' | 'soapO' | 'soapA' | 'soapP'

interface Props {
  soapS?: string | null
  soapO?: string | null
  soapA?: string | null
  soapP?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  soapS: '',
  soapO: '',
  soapA: '',
  soapP: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:soapS': [value: string]
  'update:soapO': [value: string]
  'update:soapA': [value: string]
  'update:soapP': [value: string]
  'phrase-request': [category: PhraseCategory]
}>()

const sections: { field: SoapField; label: string; category: PhraseCategory }[] = [
  { field: 'soapS', label: 'S — 主觀（Subjective）', category: 'subjective' },
  { field: 'soapO', label: 'O — 客觀（Objective）', category: 'objective' },
  { field: 'soapA', label: 'A — 評估（Assessment）', category: 'assessment' },
  { field: 'soapP', label: 'P — 計畫（Plan）', category: 'plan' },
]

const textareaRefs = ref<Record<SoapField, HTMLTextAreaElement | null>>({
  soapS: null,
  soapO: null,
  soapA: null,
  soapP: null,
})

function fieldValue(field: SoapField): string {
  return props[field] ?? ''
}

function emitUpdate(field: SoapField, value: string) {
  switch (field) {
    case 'soapS':
      emit('update:soapS', value)
      break
    case 'soapO':
      emit('update:soapO', value)
      break
    case 'soapA':
      emit('update:soapA', value)
      break
    case 'soapP':
      emit('update:soapP', value)
      break
  }
}

function insertAtCursor(category: PhraseCategory, text: string) {
  const section = sections.find((s) => s.category === category)
  const field: SoapField = section ? section.field : 'soapS'
  const el = textareaRefs.value[field]
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const current = fieldValue(field)
  const updated = current.substring(0, start) + text + current.substring(end)
  emitUpdate(field, updated)
  // 恢復游標
  requestAnimationFrame(() => {
    el.focus()
    el.selectionStart = el.selectionEnd = start + text.length
  })
}

defineExpose({ insertAtCursor })
</script>

<template>
  <div class="space-y-4">
    <div v-for="section in sections" :key="section.field">
      <div class="flex items-center justify-between mb-1">
        <label class="text-sm font-medium text-gray-700">{{ section.label }}</label>
        <button
          v-if="!disabled"
          class="text-xs text-primary hover:underline"
          @click="emit('phrase-request', section.category)"
        >
          插入片語
        </button>
      </div>
      <textarea
        :ref="(el) => { textareaRefs[section.field] = el as HTMLTextAreaElement | null }"
        :value="fieldValue(section.field)"
        :disabled="disabled"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
        :placeholder="`輸入${section.label.split('—')[1]?.trim() ?? ''}...`"
        @input="emitUpdate(section.field, ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
  </div>
</template>
