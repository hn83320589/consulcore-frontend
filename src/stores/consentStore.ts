import { defineStore } from 'pinia'
import { ref } from 'vue'
import consentService from '@/services/consentService'
import type {
  ConsentTemplate,
  ConsentTriggerEvent,
  CreateConsentTemplateRequest,
  UpdateConsentTemplateRequest,
  ConsentRecord,
  ConsentRecordSearchParams,
  SignConsentRequest,
} from '@/types'

export const useConsentStore = defineStore('consent', () => {
  const templates = ref<ConsentTemplate[]>([])
  const records = ref<ConsentRecord[]>([])
  const loading = ref(false)

  // ── Templates ────────────────────────────────
  async function fetchTemplates() {
    loading.value = true
    try {
      templates.value = await consentService.getTemplates()
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(payload: CreateConsentTemplateRequest) {
    const created = await consentService.createTemplate(payload)
    templates.value.push(created)
    return created
  }

  async function updateTemplate(id: number, payload: UpdateConsentTemplateRequest) {
    const updated = await consentService.updateTemplate(id, payload)
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx !== -1) templates.value[idx] = updated
    return updated
  }

  async function deleteTemplate(id: number) {
    await consentService.deleteTemplate(id)
    templates.value = templates.value.filter((t) => t.id !== id)
  }

  // ── Records ──────────────────────────────────
  async function fetchRecords(params?: ConsentRecordSearchParams) {
    loading.value = true
    try {
      records.value = await consentService.getRecords(params)
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordsByClient(clientProfileId: number) {
    loading.value = true
    try {
      records.value = await consentService.getRecordsByClient(clientProfileId)
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordsByTriggerEvent(triggerEvent: ConsentTriggerEvent) {
    loading.value = true
    try {
      records.value = await consentService.getRecordsByTriggerEvent(triggerEvent)
    } finally {
      loading.value = false
    }
  }

  async function signConsent(payload: SignConsentRequest) {
    const record = await consentService.signConsent(payload)
    records.value.unshift(record)
    return record
  }

  async function voidRecord(id: number, reason: string) {
    const updated = await consentService.voidRecord(id, { reason })
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) records.value[idx] = updated
    return updated
  }

  return {
    templates,
    records,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchRecords,
    fetchRecordsByClient,
    fetchRecordsByTriggerEvent,
    signConsent,
    voidRecord,
  }
})
