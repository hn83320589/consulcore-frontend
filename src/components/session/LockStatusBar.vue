<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import { formatDateTime } from '@/utils/format'

interface Props {
  isLocked: boolean
  lockedAt: string | null
  lockedBy: number | null
  canUnlock?: boolean
}

withDefaults(defineProps<Props>(), {
  canUnlock: false,
})

defineEmits<{
  unlock: []
}>()

</script>

<template>
  <div
    class="flex items-center justify-between px-4 py-2 rounded-app text-sm"
    :class="isLocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'"
  >
    <div class="flex items-center gap-2">
      <span v-if="isLocked" class="text-yellow-600">🔒 已鎖定</span>
      <span v-else class="text-green-600">📝 編輯中</span>
      <span v-if="isLocked && lockedAt" class="text-yellow-500 text-xs">
        {{ formatDateTime(lockedAt) }}{{ lockedBy ? ` · ${lockedBy}` : '' }}
      </span>
    </div>
    <AppButton
      v-if="isLocked && canUnlock"
      size="sm"
      variant="secondary"
      @click="$emit('unlock')"
    >
      解鎖
    </AppButton>
  </div>
</template>
