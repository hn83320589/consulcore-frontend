<script lang="ts">
// 目前開啟中的對話框（後開的在最後）：ESC 與 Tab 循環只由最上層處理，疊開時不會一次全關
const openStack: symbol[] = []
</script>

<script setup lang="ts">
import { watch, onUnmounted, nextTick, ref, useId } from 'vue'

interface Props {
  open: boolean
  title?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: 'max-w-lg',
})

const emit = defineEmits<{
  close: []
}>()

const self = Symbol('modal')
const titleId = useId()
const dialogRef = ref<HTMLElement | null>(null)
let returnFocusTo: HTMLElement | null = null

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusables(): HTMLElement[] {
  return dialogRef.value ? Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE)) : []
}

function isTopmost() {
  return openStack[openStack.length - 1] === self
}

function handleKeydown(e: KeyboardEvent) {
  if (!isTopmost()) return
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.key !== 'Tab') return

  // focus trap：Tab / Shift+Tab 在對話框內循環
  const items = focusables()
  if (items.length === 0) return
  const first = items[0]!
  const last = items[items.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

async function activate() {
  openStack.push(self)
  returnFocusTo = document.activeElement as HTMLElement | null
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
  await nextTick()
  ;(focusables()[0] ?? dialogRef.value)?.focus()
}

function deactivate() {
  const index = openStack.indexOf(self)
  if (index === -1) return
  openStack.splice(index, 1)
  document.removeEventListener('keydown', handleKeydown)
  if (openStack.length === 0) document.body.style.overflow = ''
  // 焦點回到開啟對話框前的元素（通常是觸發按鈕），鍵盤使用者不會迷失位置
  returnFocusTo?.focus()
  returnFocusTo = null
}

watch(
  () => props.open,
  (val) => (val ? activate() : deactivate()),
  { immediate: true },
)

onUnmounted(deactivate)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="emit('close')"
        />

        <!-- Dialog -->
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          tabindex="-1"
          class="relative bg-white rounded-app shadow-xl w-full max-h-[90vh] flex flex-col focus:outline-none"
          :class="width"
        >
          <!-- Header -->
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 :id="titleId" class="text-lg font-semibold text-gray-800">{{ title }}</h2>
            <button
              type="button"
              aria-label="關閉"
              class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              @click="emit('close')"
            >
              &times;
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
