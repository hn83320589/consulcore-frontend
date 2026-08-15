<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import type { NotificationEventType } from '@/types'
import { notificationEventMeta } from '@/types'

const authStore = useAuthStore()
const notifStore = useNotificationStore()
const uiStore = useUiStore()

const activeSection = ref<'profile' | 'password' | 'notifications'>('profile')

// ── Password ────────────────────────────────
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const changingPassword = ref(false)

async function handleChangePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    uiStore.showToast('新密碼不一致', 'error')
    return
  }
  changingPassword.value = true
  try {
    await authStore.changePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword)
    uiStore.showToast('密碼已更新', 'success')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch { uiStore.showToast('更新失敗', 'error') }
  finally { changingPassword.value = false }
}

// ── Notification Preferences ────────────────
function prefLabel(eventType: NotificationEventType): string {
  return notificationEventMeta[eventType]?.label ?? eventType
}
function isRequired(eventType: NotificationEventType): boolean {
  return notificationEventMeta[eventType]?.required ?? false
}

async function togglePref(eventType: NotificationEventType, channel: 'email' | 'sms' | 'inApp', value: boolean) {
  const pref = notifStore.preferences.find((p) => p.eventType === eventType)
  if (!pref || isRequired(eventType)) return
  try {
    await notifStore.updatePreference({
      eventType,
      emailEnabled: channel === 'email' ? value : pref.emailEnabled,
      smsEnabled: channel === 'sms' ? value : pref.smsEnabled,
      inAppEnabled: channel === 'inApp' ? value : pref.inAppEnabled,
    })
  } catch { uiStore.showToast('更新失敗', 'error') }
}

onMounted(() => notifStore.fetchPreferences())
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-app-text mb-6">設定</h1>

    <!-- Section Nav -->
    <div class="flex gap-1 border-b border-orange-100 mb-6">
      <button
        v-for="s in ([{key:'profile',label:'個人資料'},{key:'password',label:'變更密碼'},{key:'notifications',label:'通知偏好'}] as const)"
        :key="s.key"
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
        :class="activeSection === s.key ? 'text-primary border-primary' : 'text-app-text/50 border-transparent'"
        @click="activeSection = s.key"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- Profile -->
    <div v-if="activeSection === 'profile'" class="bg-white rounded-app border border-orange-100 p-6 max-w-lg">
      <div class="space-y-3 text-sm">
        <div><span class="text-app-text/50">姓名：</span>{{ authStore.user?.displayName }}</div>
        <div><span class="text-app-text/50">帳號：</span>{{ authStore.user?.username }}</div>
        <div><span class="text-app-text/50">Email：</span>{{ authStore.user?.email }}</div>
      </div>
    </div>

    <!-- Password -->
    <div v-if="activeSection === 'password'" class="bg-white rounded-app border border-orange-100 p-6 max-w-lg">
      <form class="space-y-4" @submit.prevent="handleChangePassword">
        <AppInput v-model="passwordForm.currentPassword" label="目前密碼" type="password" />
        <AppInput v-model="passwordForm.newPassword" label="新密碼" type="password" />
        <AppInput v-model="passwordForm.confirmPassword" label="確認新密碼" type="password" />
        <AppButton :loading="changingPassword" type="submit">更新密碼</AppButton>
      </form>
    </div>

    <!-- Notification Preferences -->
    <div v-if="activeSection === 'notifications'" class="bg-white rounded-app border border-orange-100 overflow-hidden max-w-2xl">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-orange-50/50 border-b border-orange-100">
            <th class="px-4 py-3 text-left text-app-text/70">通知類型</th>
            <th class="px-4 py-3 text-center text-app-text/70 w-20">Email</th>
            <th class="px-4 py-3 text-center text-app-text/70 w-20">簡訊</th>
            <th class="px-4 py-3 text-center text-app-text/70 w-20">站內</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pref in notifStore.preferences" :key="pref.eventType" class="border-b border-orange-50">
            <td class="px-4 py-3">
              {{ prefLabel(pref.eventType) }}
              <span v-if="isRequired(pref.eventType)" class="text-[10px] text-red-400 ml-1">必要</span>
            </td>
            <td class="px-4 py-3 text-center">
              <input type="checkbox" :checked="pref.emailEnabled" :disabled="isRequired(pref.eventType)" class="accent-[var(--color-primary)]"
                @change="togglePref(pref.eventType, 'email', !pref.emailEnabled)" />
            </td>
            <td class="px-4 py-3 text-center">
              <input type="checkbox" :checked="pref.smsEnabled" :disabled="isRequired(pref.eventType)" class="accent-[var(--color-primary)]"
                @change="togglePref(pref.eventType, 'sms', !pref.smsEnabled)" />
            </td>
            <td class="px-4 py-3 text-center">
              <input type="checkbox" :checked="pref.inAppEnabled" :disabled="isRequired(pref.eventType)" class="accent-[var(--color-primary)]"
                @change="togglePref(pref.eventType, 'inApp', !pref.inAppEnabled)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
