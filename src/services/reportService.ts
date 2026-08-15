import httpService from './httpService'
import type { MonthlyRevenue, TherapistRevenue, BillingRecord, PackageStats } from '@/types'

const reportService = {
  getMonthlyRevenue(year: number, month: number): Promise<MonthlyRevenue> {
    return httpService.get<MonthlyRevenue>('/reports/monthly-revenue', { params: { year, month } })
  },
  getRevenueByTherapist(year: number, month: number): Promise<TherapistRevenue[]> {
    return httpService.get<TherapistRevenue[]>('/reports/by-therapist', { params: { year, month } })
  },
  getPendingPayments(): Promise<BillingRecord[]> {
    return httpService.get<BillingRecord[]>('/reports/pending')
  },
  getPackageStats(): Promise<PackageStats> {
    return httpService.get<PackageStats>('/reports/package-stats')
  },
}

export default reportService
