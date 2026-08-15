<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

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

// ESC 關閉
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      document.addEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
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
          class="relative bg-white rounded-app shadow-xl w-full max-h-[90vh] flex flex-col"
          :class="width"
        >
          <!-- Header -->
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
            <button
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
