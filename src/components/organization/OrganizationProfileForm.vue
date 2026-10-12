<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import organizationService from '@/services/organizationService'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { notifyError } from '@/utils/notifyError'

const authStore = useAuthStore()
const uiStore = useUiStore()

const form = ref({ name: '', phone: '', email: '', address: '' })
const loaded = ref(false)
const saving = ref(false)

const canSave = computed(() => loaded.value && form.value.name.trim() !== '')

onMounted(async () => {
  try {
    const org = await organizationService.getOrganization()
    form.value = { name: org.name, phone: org.phone ?? '', email: org.email ?? '', address: org.address ?? '' }
    loaded.value = true
  } catch (e) {
    notifyError(e, '無法載入機構資料')
  }
})

async function handleSave() {
  if (!canSave.value) return
  saving.value = true
  try {
    // PUT 為整筆取代：空白欄位送 null（清除）
    const updated = await organizationService.updateOrganization({
      name: form.value.name.trim(),
      phone: form.value.phone.trim() || null,
      email: form.value.email.trim() || null,
      address: form.value.address.trim() || null,
    })
    // 頁首與儀表板顯示的機構名稱來自登入資訊，同步更新
    if (authStore.user) authStore.user.organizationName = updated.name
    uiStore.showToast('機構資料已更新', 'success')
  } catch (e) {
    notifyError(e, '更新失敗')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="bg-white border border-gray-200 rounded-app p-6 max-w-xl space-y-4" @submit.prevent="handleSave">
    <AppInput v-model="form.name" label="機構名稱" placeholder="必填" />
    <AppInput v-model="form.phone" label="電話" placeholder="選填" />
    <AppInput v-model="form.email" label="Email" type="email" placeholder="選填" />
    <AppInput v-model="form.address" label="地址" placeholder="選填" />
    <div class="flex justify-end">
      <AppButton type="submit" :loading="saving" :disabled="!canSave">儲存</AppButton>
    </div>
  </form>
</template>
