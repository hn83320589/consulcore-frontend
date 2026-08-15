import { defineStore } from 'pinia'
import { ref } from 'vue'
import formService from '@/services/formService'
import type {
  FormTemplateResponse,
  CreateFormTemplateRequest,
  UpdateFormTemplateRequest,
  FormSubmissionResponse,
  SubmitFormRequest,
} from '@/types'

export const useFormBuilderStore = defineStore('formBuilder', () => {
  const templates = ref<FormTemplateResponse[]>([])
  const submissions = ref<FormSubmissionResponse[]>([])
  const loading = ref(false)

  async function fetchTemplates() {
    loading.value = true
    try {
      templates.value = await formService.getTemplates()
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(payload: CreateFormTemplateRequest) {
    const created = await formService.createTemplate(payload)
    templates.value.push(created)
    return created
  }

  async function updateTemplate(id: number, payload: UpdateFormTemplateRequest) {
    const updated = await formService.updateTemplate(id, payload)
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx !== -1) templates.value[idx] = updated
    return updated
  }

  async function deleteTemplate(id: number) {
    await formService.deleteTemplate(id)
    templates.value = templates.value.filter((t) => t.id !== id)
  }

  async function cloneTemplate(id: number) {
    const cloned = await formService.cloneTemplate(id)
    templates.value.push(cloned)
    return cloned
  }

  async function fetchSubmissionsByClient(clientProfileId: number) {
    submissions.value = await formService.getSubmissionsByClient(clientProfileId)
  }

  async function submitForm(payload: SubmitFormRequest) {
    const sub = await formService.submitForm(payload)
    submissions.value.unshift(sub)
    return sub
  }

  return {
    templates,
    submissions,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    fetchSubmissionsByClient,
    submitForm,
  }
})
