<script setup lang="ts">
import { ref, computed } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import type { CreateAppointmentRequest, SessionType, VisitType, ScheduleSlot } from '@/types'

interface Props {
  open: boolean
  clients?: { id: number; name: string }[]
  slots?: ScheduleSlot[]
}

const props = withDefaults(defineProps<Props>(), {
  clients: () => [],
  slots: () => [],
})

const emit = defineEmits<{
  close: []
  book: [payload: CreateAppointmentRequest]
}>()

const form = ref({
  clientProfileId: '',
  scheduleSlotId: '',
  sessionType: 'individual',
  visitType: 'follow_up',
  note: '',
})

const saving = ref(false)

const clientOptions = computed(() =>
  props.clients.map((c) => ({ label: c.name, value: String(c.id) })),
)
const slotOptions = computed(() =>
  props.slots.map((s) => ({
    label: `${s.date} ${s.startTime}-${s.endTime} · ${s.therapistName}${s.roomName ? ' · ' + s.roomName : ''}`,
    value: String(s.id),
  })),
)
const sessionTypeOptions = [
  { label: '個別', value: 'individual' },
  { label: '伴侶', value: 'couple' },
  { label: '家庭', value: 'family' },
]
const visitTypeOptions = [
  { label: '初談', value: 'initial' },
  { label: '後續', value: 'follow_up' },
]

const canSubmit = computed(() => !!form.value.clientProfileId && !!form.value.scheduleSlotId)

async function handleBook() {
  if (!canSubmit.value) return
  saving.value = true
  try {
    emit('book', {
      clientProfileId: Number(form.value.clientProfileId),
      scheduleSlotId: Number(form.value.scheduleSlotId),
      sessionType: form.value.sessionType as SessionType,
      visitType: form.value.visitType as VisitType,
      note: form.value.note || undefined,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModal :open="open" title="快速建立預約" width="max-w-lg" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="handleBook">
      <AppSelect v-model="form.clientProfileId" label="個案" :options="clientOptions" placeholder="選擇個案" />
      <AppSelect v-model="form.scheduleSlotId" label="時段" :options="slotOptions" placeholder="選擇可預約時段" />
      <div class="grid grid-cols-2 gap-3">
        <AppSelect v-model="form.sessionType" label="晤談類型" :options="sessionTypeOptions" />
        <AppSelect v-model="form.visitType" label="就診類型" :options="visitTypeOptions" />
      </div>
      <AppInput v-model="form.note" label="備註" placeholder="選填" />
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="emit('close')">取消</AppButton>
      <AppButton :loading="saving" :disabled="!canSubmit" @click="handleBook">建立預約</AppButton>
    </template>
  </AppModal>
</template>
