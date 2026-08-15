<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const store = useNotificationStore()
const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value && store.notifications.length === 0) {
    store.fetchNotifications()
  }
}

function handleClick(id: number) {
  store.markAsRead(id)
}

function goToAll() {
  open.value = false
  router.push('/admin/notifications')
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '剛剛'
  if (min < 60) return `${min} 分鐘前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小時前`
  return `${Math.floor(hr / 24)} 天前`
}

onMounted(() => {
  store.fetchUnreadCount()
  document.addEventListener('click', handleClickOutside)
  pollTimer = setInterval(() => store.fetchUnreadCount(), 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button class="relative p-2 text-gray-500 hover:text-gray-700 transition-colors" @click="toggle">
      <span class="text-lg">🔔</span>
      <span
        v-if="store.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center"
      >
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition-all duration-100"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-app shadow-lg z-50"
      >
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-700">通知</span>
          <button
            v-if="store.unreadCount > 0"
            class="text-xs text-primary hover:underline"
            @click="store.markAllAsRead()"
          >
            全部已讀
          </button>
        </div>
        <div class="max-h-80 overflow-y-auto">
          <div v-if="store.notifications.length === 0" class="p-4 text-center text-sm text-gray-400">
            沒有通知
          </div>
          <button
            v-for="n in store.notifications.slice(0, 8)"
            :key="n.id"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
            :class="n.status === 'read' ? '' : 'bg-blue-50/50'"
            @click="handleClick(n.id)"
          >
            <p class="text-sm text-gray-700 line-clamp-2">{{ n.subject }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatTime(n.createdAt) }}</p>
          </button>
        </div>
        <div class="px-4 py-2 border-t border-gray-100">
          <button class="text-xs text-primary hover:underline" @click="goToAll">查看全部</button>
        </div>
      </div>
    </Transition>
  </div>
</template>
