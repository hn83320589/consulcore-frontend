import type { Schemas } from './schema'

// ── Enums ─────────────────────────────────
export type DiscountType = Schemas['DiscountResponseDto']['discountType']
export type PaymentStatus = Schemas['PaymentRecordResponseDto']['status']
export type PaymentMethod = Schemas['PaymentRecordResponseDto']['paymentMethod']
export type PaymentType = Schemas['PaymentRecordResponseDto']['paymentType']
export type ClientPackageStatus = Schemas['ClientPackageResponseDto']['status']

// ── Fee Schedule ────────────────────────────
export type FeeSchedule = Schemas['FeeScheduleResponseDto']

export type CreateFeeScheduleRequest = Schemas['CreateFeeScheduleDto']

export type UpdateFeeScheduleRequest = Schemas['UpdateFeeScheduleDto']

// ── Package ─────────────────────────────────
export type Package = Schemas['PackageResponseDto']

export type CreatePackageRequest = Schemas['CreatePackageDto']

export type UpdatePackageRequest = Schemas['UpdatePackageDto']

// ── Discount ────────────────────────────────
export type Discount = Schemas['DiscountResponseDto']

export type CreateDiscountRequest = Schemas['CreateDiscountDto']

export type UpdateDiscountRequest = Schemas['UpdateDiscountDto']

export type AssignDiscountRequest = Schemas['AssignDiscountDto']

// ── Billing Record（PaymentRecordResponse）──
export type BillingRecord = Schemas['PaymentRecordResponseDto']

export interface BillingSearchParams {
  startDate?: string
  endDate?: string
  clientProfileId?: number
  therapistUserId?: number
  status?: PaymentStatus
  page?: number
  pageSize?: number
}

export type ConfirmPaymentRequest = Schemas['ConfirmPaymentDto']

export type RefundRequest = Schemas['RefundDto']

// ── Client Package（ClientPackageResponse）──
export type PackagePurchase = Schemas['ClientPackageResponseDto']

export type PurchasePackageRequest = Schemas['PurchasePackageDto']

// ── Reports ─────────────────────────────────
export type MonthlyRevenue = Schemas['MonthlyRevenueDto']

export type TherapistRevenue = Schemas['TherapistRevenueDto']

export type PackageRemaining = Schemas['PackageRemainingDto']

export type PackageStats = Schemas['PackageStatsDto']
