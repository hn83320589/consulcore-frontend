<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  content: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:content': [content: string]
  'phrase-request': []
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

function insertAtCursor(text: string) {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const updated = props.content.substring(0, start) + text + props.content.substring(end)
  emit('update:content', updated)
  requestAnimationFrame(() => {
    el.focus()
    el.selectionStart = el.selectionEnd = start + text.length
  })
}

defineExpose({ insertAtCursor })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-1">
      <label class="text-sm font-medium text-gray-700">自由文字</label>
      <button
        v-if="!disabled"
        class="text-xs text-primary hover:underline"
        @click="emit('phrase-request')"
      >
        插入片語
      </button>
    </div>
    <textarea
      ref="textareaRef"
      :value="content"
      :disabled="disabled"
      rows="16"
      class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
      placeholder="輸入晤談紀錄..."
      @input="emit('update:content', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>
