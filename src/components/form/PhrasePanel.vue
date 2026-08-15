<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PhraseTemplate, PhraseCategory } from '@/types'

interface Props {
  phrases: PhraseTemplate[]
  activeCategory?: PhraseCategory
}

const props = withDefaults(defineProps<Props>(), {
  activeCategory: 'general',
})

const emit = defineEmits<{
  insert: [content: string]
  manage: []
}>()

const currentCategory = ref<PhraseCategory>(props.activeCategory)

const categories: { key: PhraseCategory; label: string }[] = [
  { key: 'subjective', label: 'S 主觀' },
  { key: 'objective', label: 'O 客觀' },
  { key: 'assessment', label: 'A 評估' },
  { key: 'plan', label: 'P 計畫' },
  { key: 'general', label: '通用' },
]

const filteredPhrases = computed(() =>
  props.phrases.filter((p) => p.category === currentCategory.value),
)
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-app flex flex-col h-full">
    <div class="px-3 py-2 border-b border-gray-100">
      <h4 class="font-semibold text-gray-700 text-sm">常用片語</h4>
    </div>

    <!-- Category Tabs -->
    <div class="flex border-b border-gray-100 overflow-x-auto">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="px-2.5 py-1.5 text-xs whitespace-nowrap border-b-2 -mb-px"
        :class="currentCategory === cat.key
          ? 'text-primary border-primary font-medium'
          : 'text-gray-400 border-transparent hover:text-gray-600'"
        @click="currentCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Phrase List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <button
        v-for="phrase in filteredPhrases"
        :key="phrase.id"
        class="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
        :title="phrase.content"
        @click="emit('insert', phrase.content)"
      >
        <p class="text-xs font-medium text-gray-700 truncate">{{ phrase.title }}</p>
        <p class="text-[11px] text-gray-400 truncate">{{ phrase.content }}</p>
      </button>
      <p v-if="filteredPhrases.length === 0" class="text-xs text-gray-400 text-center py-4">
        此分類無片語
      </p>
    </div>

    <!-- Manage Link -->
    <div class="px-3 py-2 border-t border-gray-100">
      <button
        class="text-xs text-primary hover:underline"
        @click="emit('manage')"
      >
        管理片語
      </button>
    </div>
  </div>
</template>
