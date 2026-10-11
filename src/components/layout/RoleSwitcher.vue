<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { RoleCode } from '@/types'

const authStore = useAuthStore()
const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const roleLabels: Record<RoleCode, string> = {
  owner: '機構負責人',
  therapist: '心理師',
  admin: '行政人員',
  client: '個案',
}

function handleSwitch(role: RoleCode) {
  open.value = false
  authStore.switchRole(role)
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div v-if="authStore.hasMultipleRoles" ref="dropdownRef" class="relative">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-app border border-gray-200 hover:bg-gray-50"
      @click="open = !open"
    >
      <span>{{ authStore.activeRole ? roleLabels[authStore.activeRole] : '選擇角色' }}</span>
      <span class="text-xs transition-transform" :class="open ? 'rotate-180' : ''">▼</span>
    </button>

    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition-all duration-100"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-app shadow-lg z-50 py-1"
      >
        <button
          v-for="role in authStore.roles"
          :key="role"
          class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
          :class="role === authStore.activeRole ? 'text-primary font-medium' : 'text-gray-600'"
          @click="handleSwitch(role as RoleCode)"
        >
          <span>{{ roleLabels[role as RoleCode] }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
