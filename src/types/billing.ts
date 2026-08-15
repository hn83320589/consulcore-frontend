import type { SessionType, VisitType } from './appointment'

// ── Enums（契約 6，一字不差）─────────────────
export type DiscountType = 'percentage' | 'fixed_amount'
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'waived'
export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'line_pay' | 'other'
export type PaymentType = 'single_session' | 'package_purchase'
export type ClientPackageStatus = 'active' | 'expired' | 'completed'

// ── Fee Schedule ────────────────────────────
export interface FeeSchedule {
  id: number
  name: string
  sessionType: SessionType
  visitType: VisitType
  therapistUserId?: number | null // null = 全機構通用
  therapistName?: string | null
  amount: number
  currency: string
  isActive: boolean
}

export interface CreateFeeScheduleRequest {
  name: string
  sessionType?: SessionType
  visitType?: VisitType
  therapistUserId?: number | null
  amount: number
}

export interface UpdateFeeScheduleRequest {
  name?: string | null
  amount?: number | null
  isActive?: boolean | null
}

// ── Package ─────────────────────────────────
export interface Package {
  id: number
  name: string
  sessionType: SessionType
  totalSessions: number
  totalAmount: number
  perSessionAmount: number
  validDays: number
  isActive: boolean
}

export interface CreatePackageRequest {
  name: string
  sessionType?: SessionType
  totalSessions: number
  totalAmount: number
  validDays?: number
}

export interface UpdatePackageRequest {
  name?: string | null
  totalAmount?: number | null
  validDays?: number | null
  isActive?: boolean | null
}

// ── Discount ────────────────────────────────
export interface Discount {
  id: number
  name: string
  discountType: DiscountType
  percentageValue?: number | null
  fixedAmount?: number | null
  applicableRole?: string | null
  therapistUserId?: number | null
  isActive: boolean
}

export interface CreateDiscountRequest {
  name: string
  discountType?: DiscountType
  percentageValue?: number | null
  fixedAmount?: number | null
  applicableRole?: string | null
  therapistUserId?: number | null
}

export interface UpdateDiscountRequest {
  name?: string | null
  percentageValue?: number | null
  fixedAmount?: number | null
  isActive?: boolean | null
}

export interface AssignDiscountRequest {
  clientProfileId: number
  discountId: number
  note?: string | null
}

// ── Billing Record（PaymentRecordResponse）──
export interface BillingRecord {
  id: number
  clientProfileId: number
  clientName: string
  appointmentId?: number | null
  clientPackageId?: number | null
  discountId?: number | null
  discountName?: string | null
  originalAmount: number
  finalAmount: number
  paymentMethod: PaymentMethod
  paymentType: PaymentType
  status: PaymentStatus
  note?: string | null
  paidAt?: string | null
  createdAt: string
}

export interface BillingSearchParams {
  startDate?: string
  endDate?: string
  clientProfileId?: number
  therapistUserId?: number
  status?: PaymentStatus
  page?: number
  pageSize?: number
}

export interface ConfirmPaymentRequest {
  paymentMethod?: PaymentMethod
}

export interface RefundRequest {
  note?: string | null
}

// ── Client Package（ClientPackageResponse）──
export interface PackagePurchase {
  id: number
  clientProfileId: number
  clientName: string
  packageId: number
  packageName: string
  sessionsUsed: number
  sessionsRemaining: number
  status: ClientPackageStatus
  purchasedAt: string
  expiresAt: string
}

export interface PurchasePackageRequest {
  clientProfileId: number
  packageId: number
  paymentMethod?: PaymentMethod
}

// ── Reports ─────────────────────────────────
export interface MonthlyRevenue {
  year: number
  month: number
  totalRevenue: number
  totalTransactions: number
  paidAmount: number
  pendingAmount: number
  refundedAmount: number
  waivedAmount: number
}

export interface TherapistRevenue {
  therapistUserId: number
  therapistName: string
  totalRevenue: number
  totalSessions: number
}

export interface PackageRemaining {
  clientPackageId: number
  clientName: string
  packageName: string
  sessionsRemaining: number
  expiresAt: string
}

export interface PackageStats {
  activePackages: number
  expiredPackages: number
  completedPackages: number
  totalPackageRevenue: number
  lowRemaining: PackageRemaining[]
}
