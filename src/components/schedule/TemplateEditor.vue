<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useTherapistOptions } from '@/composables/useTherapistOptions'
import type { ScheduleTemplate, DayOfWeek } from '@/types'

/** TemplateEditor 對外送出的表單值（單日排班範本，對齊契約） */
export interface TemplateFormValue {
  therapistUserId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
  isActive: boolean
}

interface Props {
  /** 編輯中的範本；null=新增模式 */
  template?: ScheduleTemplate | null
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  template: null,
  saving: false,
})

const emit = defineEmits<{
  save: [value: TemplateFormValue]
}>()

const isEdit = computed(() => !!props.template)

const dayLabels: Record<DayOfWeek, string> = {
  0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
}
const days: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0]
const dayOptions = days.map((d) => ({ label: `週${dayLabels[d]}`, value: String(d) }))
const { options: therapistOptions } = useTherapistOptions()

// ── Form state ──────────────────────────────
// 契約：新增時可設 therapistUserId + dayOfWeek；編輯時僅能改 start/end/duration/isActive
const therapistUserId = ref('')
const dayOfWeek = ref('')
const startTime = ref('09:00')
const endTime = ref('17:00')
const slotDuration = ref('50')
const isActive = ref(true)

function syncFromProps() {
  if (props.template) {
    therapistUserId.value = String(props.template.therapistUserId)
    dayOfWeek.value = String(props.template.dayOfWeek)
    startTime.value = props.template.startTime.slice(0, 5)
    endTime.value = props.template.endTime.slice(0, 5)
    slotDuration.value = String(props.template.slotDuration)
    isActive.value = props.template.isActive
  } else {
    therapistUserId.value = ''
    dayOfWeek.value = ''
    startTime.value = '09:00'
    endTime.value = '17:00'
    slotDuration.value = '50'
    isActive.value = true
  }
}

watch(() => props.template, syncFromProps, { immediate: true })

const canSave = computed(() => {
  const dur = Number(slotDuration.value)
  if (!startTime.value || !endTime.value) return false
  if (!(dur >= 10 && dur <= 120)) return false
  if (!isEdit.value) {
    if (!therapistUserId.value || Number.isNaN(Number(therapistUserId.value))) return false
    if (dayOfWeek.value === '') return false
  }
  return true
})

function handleSave() {
  if (!canSave.value) return
  emit('save', {
    therapistUserId: Number(therapistUserId.value),
    dayOfWeek: Number(dayOfWeek.value),
    startTime: startTime.value,
    endTime: endTime.value,
    slotDuration: Number(slotDuration.value),
    isActive: isActive.value,
  })
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-app p-6">
    <h3 class="font-semibold text-gray-800 mb-4">
      {{ isEdit ? '編輯排班範本' : '新增排班範本' }}
    </h3>

    <div class="flex flex-wrap items-end gap-3 mb-4">
      <!-- 心理師：新增可填、編輯唯讀 -->
      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1">心理師</label>
        <p class="px-3 py-2 text-sm text-gray-800">{{ props.template?.therapistName }}</p>
      </div>
      <AppSelect
        v-else
        v-model="therapistUserId"
        label="心理師"
        :options="therapistOptions"
        placeholder="選擇心理師"
      />

      <!-- 星期：新增可選、編輯唯讀（契約 Update 不含 dayOfWeek） -->
      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1">星期</label>
        <p class="px-3 py-2 text-sm text-gray-800">
          週{{ dayLabels[(props.template?.dayOfWeek ?? 0) as DayOfWeek] }}
        </p>
      </div>
      <AppSelect
        v-else
        v-model="dayOfWeek"
        label="星期"
        :options="dayOptions"
        placeholder="選星期"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">開始</label>
        <input
          v-model="startTime"
          type="time"
          class="px-3 py-2 border border-gray-300 rounded-app text-sm"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">結束</label>
        <input
          v-model="endTime"
          type="time"
          class="px-3 py-2 border border-gray-300 rounded-app text-sm"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">單節長度（分）</label>
        <input
          v-model="slotDuration"
          type="number"
          min="10"
          max="120"
          class="w-28 px-3 py-2 border border-gray-300 rounded-app text-sm"
        />
      </div>

      <label v-if="isEdit" class="flex items-center gap-2 text-sm text-gray-700 pb-2">
        <input v-model="isActive" type="checkbox" />
        啟用
      </label>
    </div>

    <div class="flex items-center justify-end">
      <AppButton :loading="saving" :disabled="!canSave" @click="handleSave">
        {{ isEdit ? '儲存範本' : '新增範本' }}
      </AppButton>
    </div>
  </div>
</template>
