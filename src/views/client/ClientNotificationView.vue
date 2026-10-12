<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { formatShortDateTime } from '@/utils/format'
import { DEFAULT_PAGE_SIZE } from '@/utils/paging'

const store = useNotificationStore()
const page = ref(1)

function load() {
  return store.fetchNotifications({ page: page.value, pageSize: DEFAULT_PAGE_SIZE })
}

function goPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-app-text">通知</h1>
      <AppButton v-if="store.unreadCount > 0" size="sm" variant="secondary" @click="store.markAllAsRead()">
        全部已讀
      </AppButton>
    </div>

    <div v-if="store.loading" class="text-center py-8 text-app-text/40">載入中...</div>
    <div v-else-if="store.notifications.length === 0" class="text-center py-12 text-app-text/40">
      目前沒有通知
    </div>
    <div v-else class="space-y-2">
      <button
        v-for="n in store.notifications"
        :key="n.id"
        class="w-full text-left bg-white rounded-app border p-4 transition-colors"
        :class="n.status === 'read' ? 'border-orange-100' : 'border-primary/30 bg-orange-50/30'"
        @click="store.markAsRead(n.id)"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="font-medium text-app-text" :class="n.status === 'read' ? '' : 'font-semibold'">
              {{ n.subject }}
            </p>
            <p class="text-sm text-app-text/60 mt-1">{{ n.body }}</p>
          </div>
          <span class="text-xs text-app-text/40 whitespace-nowrap ml-3">{{ formatShortDateTime(n.createdAt) }}</span>
        </div>
        <div v-if="n.status !== 'read'" class="w-2 h-2 bg-primary rounded-full absolute top-4 left-2" />
      </button>
    </div>
    <AppPagination
      :page="page"
      :page-size="DEFAULT_PAGE_SIZE"
      :total-count="store.notificationsTotal"
      :item-count="store.notifications.length"
      :disabled="store.loading"
      @update:page="goPage"
    />
  </div>
</template>
