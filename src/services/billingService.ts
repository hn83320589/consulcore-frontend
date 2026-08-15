import httpService from './httpService'
import type {
  BillingRecord, BillingSearchParams, ConfirmPaymentRequest, RefundRequest,
  PackagePurchase, PurchasePackageRequest, ClientPackageStatus,
} from '@/types'

const billingService = {
  // 完整付款紀錄清單（可帶篩選）
  getRecords(params?: BillingSearchParams): Promise<BillingRecord[]> {
    return httpService.get<BillingRecord[]>('/billing', { params })
  },
  // 待收款清單
  getPending(): Promise<BillingRecord[]> {
    return httpService.get<BillingRecord[]>('/billing/pending')
  },
  // 個案套餐清單
  getPackages(params?: { clientProfileId?: number; status?: ClientPackageStatus }): Promise<PackagePurchase[]> {
    return httpService.get<PackagePurchase[]>('/billing/packages', { params })
  },
  // 匯出 CSV（blob，UTF-8 BOM）
  exportRecords(params?: BillingSearchParams): Promise<Blob> {
    return httpService.get<Blob>('/billing/export', { params, responseType: 'blob' })
  },
  confirmPayment(id: number, payload: ConfirmPaymentRequest): Promise<BillingRecord> {
    return httpService.post<BillingRecord>(`/billing/${id}/confirm`, payload)
  },
  refund(id: number, payload: RefundRequest): Promise<BillingRecord> {
    return httpService.post<BillingRecord>(`/billing/${id}/refund`, payload)
  },
  waive(id: number): Promise<BillingRecord> {
    return httpService.post<BillingRecord>(`/billing/${id}/waive`)
  },

  // ── Package Purchases ────────────────────────
  purchasePackage(payload: PurchasePackageRequest): Promise<PackagePurchase> {
    return httpService.post<PackagePurchase>('/billing/purchase-package', payload)
  },
  onCompleted(appointmentId: number): Promise<BillingRecord> {
    return httpService.post<BillingRecord>(`/billing/on-completed/${appointmentId}`)
  },
}

export default billingService
