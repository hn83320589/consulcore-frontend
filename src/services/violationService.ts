import httpService from './httpService'
import type {
  ViolationRecord, CreateViolationRecordRequest,
  UpdateViolationRecordRequest, ResolveViolationRequest,
} from '@/types'

const violationService = {
  getViolations(): Promise<ViolationRecord[]> {
    return httpService.get<ViolationRecord[]>('/violation-records')
  },
  createViolation(payload: CreateViolationRecordRequest): Promise<ViolationRecord> {
    return httpService.post<ViolationRecord>('/violation-records', payload)
  },
  updateViolation(id: number, payload: UpdateViolationRecordRequest): Promise<ViolationRecord> {
    return httpService.put<ViolationRecord>(`/violation-records/${id}`, payload)
  },
  resolveViolation(id: number, payload: ResolveViolationRequest): Promise<ViolationRecord> {
    return httpService.post<ViolationRecord>(`/violation-records/${id}/resolve`, payload)
  },
  dismissViolation(id: number): Promise<ViolationRecord> {
    return httpService.post<ViolationRecord>(`/violation-records/${id}/dismiss`)
  },
  deleteViolation(id: number): Promise<void> {
    return httpService.delete<void>(`/violation-records/${id}`)
  },
}

export default violationService
