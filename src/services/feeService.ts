import httpService from './httpService'
import type {
  FeeSchedule, CreateFeeScheduleRequest, UpdateFeeScheduleRequest,
  Package, CreatePackageRequest, UpdatePackageRequest,
} from '@/types'

const feeService = {
  // ── Fee Schedules ────────────────────────────
  getFeeSchedules(): Promise<FeeSchedule[]> {
    return httpService.get<FeeSchedule[]>('/fee-schedules')
  },
  createFeeSchedule(payload: CreateFeeScheduleRequest): Promise<FeeSchedule> {
    return httpService.post<FeeSchedule>('/fee-schedules', payload)
  },
  updateFeeSchedule(id: number, payload: UpdateFeeScheduleRequest): Promise<FeeSchedule> {
    return httpService.put<FeeSchedule>(`/fee-schedules/${id}`, payload)
  },
  deleteFeeSchedule(id: number): Promise<void> {
    return httpService.delete<void>(`/fee-schedules/${id}`)
  },

  // ── Packages ─────────────────────────────────
  getPackages(): Promise<Package[]> {
    return httpService.get<Package[]>('/packages')
  },
  createPackage(payload: CreatePackageRequest): Promise<Package> {
    return httpService.post<Package>('/packages', payload)
  },
  updatePackage(id: number, payload: UpdatePackageRequest): Promise<Package> {
    return httpService.put<Package>(`/packages/${id}`, payload)
  },
  deletePackage(id: number): Promise<void> {
    return httpService.delete<void>(`/packages/${id}`)
  },
}

export default feeService
