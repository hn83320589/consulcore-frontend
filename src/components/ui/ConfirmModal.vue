<script setup lang="ts">
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

interface Props {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '確認操作',
  confirmText: '確認',
  cancelText: '取消',
  variant: 'danger',
  loading: false,
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <AppModal :open="open" :title="title" width="max-w-sm" @close="$emit('cancel')">
    <p class="text-sm text-gray-600">{{ message }}</p>

    <template #footer>
      <AppButton variant="secondary" @click="$emit('cancel')">{{ cancelText }}</AppButton>
      <AppButton :variant="variant" :loading="loading" @click="$emit('confirm')">{{ confirmText }}</AppButton>
    </template>
  </AppModal>
</template>
