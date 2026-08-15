<script setup lang="ts">
import { ref } from 'vue'
import { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function parseLoginError(e: unknown): string {
  if (e instanceof AxiosError && e.response) {
    const status = e.response.status
    const data = e.response.data as { message?: string } | undefined
    if (status === 401) return '帳號或密碼錯誤'
    if (status === 403) return data?.message ?? '此帳號已被停用，請聯繫管理員'
    if (status === 429) return '登入嘗試過於頻繁，請稍後再試'
    return data?.message ?? '登入失敗，請稍後再試'
  }
  if (e instanceof Error) return e.message
  return '登入失敗，請檢查網路連線'
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login({ username: username.value, password: password.value })
  } catch (e: unknown) {
    error.value = parseLoginError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-app-bg">
    <div class="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-center text-primary mb-1">諮心管理</h1>
      <p class="text-center text-gray-400 text-sm mb-6">ConsulCore</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">帳號</label>
          <input
            v-model="username"
            type="text"
            required
            autocomplete="username"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="請輸入帳號"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="請輸入密碼"
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
          :disabled="loading || !username || !password"
          class="w-full py-2.5 bg-primary text-white font-medium rounded-app hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>
