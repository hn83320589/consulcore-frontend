<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'

export interface Tab {
  key: string
  label: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// WAI-ARIA tabs：只有目前分頁可用 Tab 鍵進入（roving tabindex），分頁間以方向鍵 / Home / End 切換
const baseId = useId()
const tabId = (key: string) => `${baseId}-tab-${key}`
const tabRefs = ref<HTMLButtonElement[]>([])

async function onKeydown(event: KeyboardEvent, index: number) {
  const last = props.tabs.length - 1
  const target = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key]
  if (target === undefined) return

  event.preventDefault()
  emit('update:modelValue', props.tabs[target]!.key)
  await nextTick()
  tabRefs.value[target]?.focus()
}
</script>

<template>
  <div>
    <!-- 放不下時整列左右滑動，分頁名稱不換行。
         灰色底線用 inset 陰影畫在容器內：原本靠 -mb-px 讓分頁底線蓋住容器邊框，
         在可捲動容器裡那 1px 會被當成溢出而出現直向捲軸 -->
    <div role="tablist" class="flex gap-1 mb-6 overflow-x-auto overflow-y-hidden scrollbar-none shadow-[inset_0_-1px_0_var(--color-gray-200)]">
      <button
        v-for="(tab, index) in tabs"
        :id="tabId(tab.key)"
        :key="tab.key"
        ref="tabRefs"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.key ? 'true' : 'false'"
        :tabindex="modelValue === tab.key ? 0 : -1"
        class="shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2"
        :class="modelValue === tab.key
          ? 'text-primary border-primary'
          : 'text-gray-500 border-transparent hover:text-gray-700'"
        @click="emit('update:modelValue', tab.key)"
        @keydown="onKeydown($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div role="tabpanel" :aria-labelledby="tabId(modelValue)">
      <slot />
    </div>
  </div>
</template>
