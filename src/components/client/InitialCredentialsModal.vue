<script setup lang="ts">
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { InitialCredentials } from '@/types'

interface Props {
  credentials: InitialCredentials | null
}

defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppModal :open="!!credentials" title="個案帳號已建立" @close="emit('close')">
    <div v-if="credentials" class="space-y-4">
      <p class="text-sm text-(--color-text)">
        請將以下帳號與初始密碼交付個案。個案首次登入時會被要求變更密碼。
      </p>
      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt class="text-gray-500">帳號</dt>
        <dd class="font-mono select-all">{{ credentials.username }}</dd>
        <dt class="text-gray-500">初始密碼</dt>
        <dd class="font-mono select-all">{{ credentials.password }}</dd>
      </dl>
      <p class="text-sm font-medium text-primary">
        初始密碼只會顯示這一次，系統不會保存明文；遺失時請以「重設密碼」處理。
      </p>
    </div>

    <template #footer>
      <AppButton @click="emit('close')">我已交付</AppButton>
    </template>
  </AppModal>
</template>
