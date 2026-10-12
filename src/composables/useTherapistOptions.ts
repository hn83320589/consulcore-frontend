import { onMounted, ref } from 'vue'
import staffService from '@/services/staffService'
import { notifyError } from '@/utils/notifyError'

export interface TherapistSelectOption {
  label: string
  value: string
}

/** 心理師下拉選單選項；value 為字串 id，與表單欄位的 v-model 一致 */
export function useTherapistOptions() {
  const options = ref<TherapistSelectOption[]>([])

  onMounted(async () => {
    try {
      const therapists = await staffService.getTherapistOptions()
      options.value = therapists.map((t) => ({ label: t.displayName, value: String(t.id) }))
    } catch (e) {
      notifyError(e, '無法載入心理師清單')
    }
  })

  return { options }
}
