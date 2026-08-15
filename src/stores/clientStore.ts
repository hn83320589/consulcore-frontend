import { defineStore } from 'pinia'
import { ref } from 'vue'
import clientService from '@/services/clientService'
import type {
  ClientProfile,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearchParams,
  ClientStatus,
} from '@/types'

export const useClientStore = defineStore('client', () => {
  const clients = ref<ClientProfile[]>([])
  const currentClient = ref<ClientProfile | null>(null)
  const loading = ref(false)

  async function fetchClients() {
    loading.value = true
    try {
      clients.value = await clientService.getClients()
    } finally {
      loading.value = false
    }
  }

  async function searchClients(params: ClientSearchParams) {
    loading.value = true
    try {
      clients.value = await clientService.searchClients(params)
    } finally {
      loading.value = false
    }
  }

  async function fetchClient(id: number) {
    loading.value = true
    try {
      currentClient.value = await clientService.getClient(id)
    } finally {
      loading.value = false
    }
  }

  async function createClient(payload: CreateClientRequest) {
    const created = await clientService.createClient(payload)
    clients.value.push(created)
    return created
  }

  async function updateClient(id: number, payload: UpdateClientRequest) {
    const updated = await clientService.updateClient(id, payload)
    if (currentClient.value?.id === id) currentClient.value = updated
    const idx = clients.value.findIndex((c) => c.id === id)
    if (idx !== -1) clients.value[idx] = updated
    return updated
  }

  async function updateStatus(id: number, status: ClientStatus) {
    const updated = await clientService.updateStatus(id, status)
    if (currentClient.value?.id === id) currentClient.value = updated
    const idx = clients.value.findIndex((c) => c.id === id)
    if (idx !== -1) clients.value[idx] = updated
    return updated
  }

  async function assignTherapist(id: number, therapistUserId: number) {
    const updated = await clientService.assignTherapist(id, { therapistUserId })
    if (currentClient.value?.id === id) currentClient.value = updated
    const idx = clients.value.findIndex((c) => c.id === id)
    if (idx !== -1) clients.value[idx] = updated
    return updated
  }

  async function transferClient(
    id: number,
    currentTherapistUserId: number,
    newTherapistUserId: number,
    reason?: string | null,
  ) {
    const updated = await clientService.transferClient(id, currentTherapistUserId, {
      newTherapistUserId,
      reason,
    })
    if (currentClient.value?.id === id) currentClient.value = updated
    const idx = clients.value.findIndex((c) => c.id === id)
    if (idx !== -1) clients.value[idx] = updated
    return updated
  }

  return {
    clients,
    currentClient,
    loading,
    fetchClients,
    searchClients,
    fetchClient,
    createClient,
    updateClient,
    updateStatus,
    assignTherapist,
    transferClient,
  }
})
