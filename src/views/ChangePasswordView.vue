<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useAuthActions } from '@/composables/useAuthActions'

const authStore = useAuthStore()
const authActions = useAuthActions()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

// 首次登入強制改密碼情境（契約 4.4）
const isForced = computed(() => authStore.mustChangePassword)

const canSubmit = computed(
  () =>
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value,
)

async function handleSubmit() {
  error.value = ''
  if (newPassword.value !== confirmPassword.value) {
    error.value = '兩次輸入的新密碼不一致'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = '新密碼至少 8 個字元'
    return
  }
  loading.value = true
  try {
    // 成功後 store 會清除狀態並導回 /login，要求重新登入換發 token
    await authActions.changePassword(currentPassword.value, newPassword.value)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '變更密碼失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-app-bg">
    <div class="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-center text-primary mb-1">變更密碼</h1>
      <p v-if="isForced" class="text-center text-gray-500 text-sm mb-6">
        首次登入請先變更預設密碼
      </p>
      <p v-else class="text-center text-gray-400 text-sm mb-6">ConsulCore</p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">目前密碼</label>
          <input
            v-model="currentPassword"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="請輸入目前密碼"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
          <input
            v-model="newPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="至少 8 個字元"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="請再次輸入新密碼"
          />
        </div>

        <div
          v-if="error"
          class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-app"
        >
          <span class="text-red-400 text-sm leading-none mt-0.5">!</span>
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading || !canSubmit"
          class="w-full py-2.5 bg-primary text-white font-medium rounded-app hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '處理中...' : '變更密碼' }}
        </button>
      </form>
    </div>
  </div>
</template>
