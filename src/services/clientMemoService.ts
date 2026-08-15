import httpService from './httpService'
import type { ClientMemo, CreateMemoRequest, UpdateMemoRequest } from '@/types'

const clientMemoService = {
  getMemos(clientProfileId: number): Promise<ClientMemo[]> {
    return httpService.get<ClientMemo[]>(`/client-memos/by-client/${clientProfileId}`)
  },
  createMemo(payload: CreateMemoRequest): Promise<ClientMemo> {
    return httpService.post<ClientMemo>('/client-memos', payload)
  },
  updateMemo(id: number, payload: UpdateMemoRequest): Promise<ClientMemo> {
    return httpService.put<ClientMemo>(`/client-memos/${id}`, payload)
  },
  deleteMemo(id: number): Promise<void> {
    return httpService.delete<void>(`/client-memos/${id}`)
  },
}

export default clientMemoService
