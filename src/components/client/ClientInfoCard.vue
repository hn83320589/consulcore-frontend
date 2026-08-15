<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ClientProfile, UpdateClientRequest } from '@/types'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'

interface Props {
  client: ClientProfile
  // 無編輯權限或代診唯讀時隱藏編輯入口（後端仍為最終防線）
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [payload: UpdateClientRequest]
}>()

const editing = ref(false)
const form = ref<UpdateClientRequest>(toForm(props.client))

watch(
  () => props.client,
  (c) => {
    if (!editing.value) form.value = toForm(c)
  },
)

function toForm(c: ClientProfile): UpdateClientRequest {
  return {
    name: c.name,
    gender: c.gender ?? undefined,
    dateOfBirth: c.dateOfBirth ?? undefined,
    idNumber: c.idNumber ?? undefined,
    phone: c.phone ?? undefined,
    email: c.email ?? undefined,
    address: c.address ?? undefined,
    emergencyContactName: c.emergencyContactName ?? undefined,
    emergencyContactPhone: c.emergencyContactPhone ?? undefined,
    emergencyContactRelationship: c.emergencyContactRelationship ?? undefined,
    occupation: c.occupation ?? undefined,
    referralSource: c.referralSource ?? undefined,
    notes: c.notes ?? undefined,
    medicalHistory: c.medicalHistory ?? undefined,
  }
}

function startEdit() {
  form.value = toForm(props.client)
  editing.value = true
}

function cancelEdit() {
  form.value = toForm(props.client)
  editing.value = false
}

function handleSave() {
  emit('save', { ...form.value })
  editing.value = false
}

interface FieldDef {
  key: keyof UpdateClientRequest
  label: string
  type?: string
}

const fields: FieldDef[] = [
  { key: 'name', label: '姓名' },
  { key: 'gender', label: '性別' },
  { key: 'dateOfBirth', label: '出生日期', type: 'date' },
  { key: 'idNumber', label: '身分證字號' },
  { key: 'phone', label: '電話' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'address', label: '地址' },
  { key: 'occupation', label: '職業' },
  { key: 'emergencyContactName', label: '緊急聯絡人' },
  { key: 'emergencyContactPhone', label: '緊急聯絡人電話' },
  { key: 'emergencyContactRelationship', label: '緊急聯絡人關係' },
  { key: 'referralSource', label: '轉介來源' },
  { key: 'notes', label: '備註' },
  { key: 'medicalHistory', label: '病史' },
]
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-app p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800">基本資料</h3>
      <div v-if="!readonly" class="flex gap-2">
        <template v-if="editing">
          <AppButton size="sm" variant="secondary" @click="cancelEdit">取消</AppButton>
          <AppButton size="sm" @click="handleSave">儲存</AppButton>
        </template>
        <AppButton v-else size="sm" variant="ghost" @click="startEdit">編輯</AppButton>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div v-for="field in fields" :key="field.key">
        <template v-if="editing">
          <AppInput
            :label="field.label"
            :type="field.type ?? 'text'"
            :model-value="(form[field.key] as string) ?? ''"
            @update:model-value="(form[field.key] as string | undefined) = $event || undefined"
          />
        </template>
        <template v-else>
          <p class="text-xs text-gray-500 mb-0.5">{{ field.label }}</p>
          <p class="text-sm text-gray-800">{{ (client[field.key as keyof ClientProfile] as string) ?? '—' }}</p>
        </template>
      </div>
    </div>
  </div>
</template>
