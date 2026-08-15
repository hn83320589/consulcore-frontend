<script setup lang="ts">
import { ref, computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import type { CreatePerformanceReviewRequest } from '@/types'

interface Props {
  saving?: boolean
}

withDefaults(defineProps<Props>(), {
  saving: false,
})

const emit = defineEmits<{
  submit: [payload: CreatePerformanceReviewRequest]
  cancel: []
}>()

const form = ref({
  therapistUserId: '',
  period: '',
  professionalScore: 3,
  clientFeedbackScore: 3,
  teamworkScore: 3,
  overallScore: 3,
  comment: '',
})

const scoreLabels = ['', '需改善', '尚可', '良好', '優良', '卓越']

interface ScoreField {
  key: 'professionalScore' | 'clientFeedbackScore' | 'teamworkScore' | 'overallScore'
  label: string
}

const scoreFields: ScoreField[] = [
  { key: 'professionalScore', label: '專業能力' },
  { key: 'clientFeedbackScore', label: '個案回饋' },
  { key: 'teamworkScore', label: '團隊合作' },
  { key: 'overallScore', label: '整體評分' },
]

const canSubmit = computed(
  () => form.value.therapistUserId.trim() !== '' && form.value.period.trim() !== '',
)

function handleSubmit() {
  const therapistUserId = Number(form.value.therapistUserId)
  if (!Number.isFinite(therapistUserId) || therapistUserId <= 0) return
  emit('submit', {
    therapistUserId,
    period: form.value.period,
    professionalScore: form.value.professionalScore,
    clientFeedbackScore: form.value.clientFeedbackScore,
    teamworkScore: form.value.teamworkScore,
    overallScore: form.value.overallScore,
    comment: form.value.comment || null,
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <AppInput v-model="form.therapistUserId" label="心理師 ID" type="number" placeholder="待接入下拉" />
    <AppInput v-model="form.period" label="考核期間" placeholder="例：2026-Q1" />

    <!-- Score Fields -->
    <div v-for="field in scoreFields" :key="field.key" class="space-y-1">
      <label class="flex items-center justify-between text-sm">
        <span class="font-medium text-app-text">{{ field.label }}</span>
        <span class="text-xs text-gray-400">{{ scoreLabels[form[field.key]] }}</span>
      </label>
      <input
        v-model.number="form[field.key]"
        type="range"
        min="1"
        max="5"
        class="w-full accent-[var(--color-primary)]"
      />
      <div class="flex justify-between text-[10px] text-gray-300">
        <span v-for="i in 5" :key="i">{{ i }}</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-app-text mb-1">評語</label>
      <textarea
        v-model="form.comment"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm"
        placeholder="考核評語..."
      />
    </div>

    <div class="flex gap-2">
      <AppButton :loading="saving" :disabled="!canSubmit" type="submit">提交考核</AppButton>
      <AppButton variant="secondary" type="button" @click="emit('cancel')">取消</AppButton>
    </div>
  </form>
</template>
