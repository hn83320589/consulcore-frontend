import httpService from './httpService'
import type {
  ClientProfile,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearchParams,
  ClientStatus,
  AssignTherapistRequest,
  TransferTherapistRequest,
} from '@/types'

const clientService = {
  getClients(): Promise<ClientProfile[]> {
    return httpService.get<ClientProfile[]>('/client-profiles')
  },
  searchClients(params: ClientSearchParams): Promise<ClientProfile[]> {
    return httpService.get<ClientProfile[]>('/client-profiles/search', { params })
  },
  getClient(id: number): Promise<ClientProfile> {
    return httpService.get<ClientProfile>(`/client-profiles/${id}`)
  },
  getByTherapist(therapistUserId: number): Promise<ClientProfile[]> {
    return httpService.get<ClientProfile[]>(`/client-profiles/by-therapist/${therapistUserId}`)
  },
  getMyClients(): Promise<ClientProfile[]> {
    return httpService.get<ClientProfile[]>('/client-profiles/my-clients')
  },
  createClient(payload: CreateClientRequest): Promise<ClientProfile> {
    return httpService.post<ClientProfile>('/client-profiles', payload)
  },
  updateClient(id: number, payload: UpdateClientRequest): Promise<ClientProfile> {
    return httpService.put<ClientProfile>(`/client-profiles/${id}`, payload)
  },
  deleteClient(id: number): Promise<void> {
    return httpService.delete<void>(`/client-profiles/${id}`)
  },
  updateStatus(id: number, status: ClientStatus): Promise<ClientProfile> {
    return httpService.patch<ClientProfile>(`/client-profiles/${id}/status`, { status })
  },
  assignTherapist(id: number, payload: AssignTherapistRequest): Promise<ClientProfile> {
    return httpService.post<ClientProfile>(`/client-profiles/${id}/assign-therapist`, payload)
  },
  transferClient(
    id: number,
    currentTherapistUserId: number,
    payload: TransferTherapistRequest,
  ): Promise<ClientProfile> {
    return httpService.post<ClientProfile>(
      `/client-profiles/${id}/transfer-therapist/${currentTherapistUserId}`,
      payload,
    )
  },
}

export default clientService
