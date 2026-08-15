<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()
</script>

<template>
  <router-view />

  <!-- Global Toast -->
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-x-4"
      leave-active-class="transition-all duration-200"
      leave-to-class="opacity-0 translate-x-4"
    >
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="px-4 py-3 rounded-app shadow-lg text-sm text-white min-w-[240px]"
        :class="{
          'bg-green-600': toast.type === 'success',
          'bg-red-500': toast.type === 'error',
          'bg-yellow-500': toast.type === 'warning',
          'bg-blue-500': toast.type === 'info',
        }"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>
