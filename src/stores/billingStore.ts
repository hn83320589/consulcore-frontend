import { defineStore } from 'pinia'
import { ref } from 'vue'
import feeService from '@/services/feeService'
import discountService from '@/services/discountService'
import billingService from '@/services/billingService'
import reportService from '@/services/reportService'
import type {
  FeeSchedule, CreateFeeScheduleRequest, UpdateFeeScheduleRequest,
  Package, CreatePackageRequest, UpdatePackageRequest,
  Discount, CreateDiscountRequest, UpdateDiscountRequest,
  BillingRecord, BillingSearchParams, ConfirmPaymentRequest, RefundRequest,
  PackagePurchase, PurchasePackageRequest, ClientPackageStatus,
  MonthlyRevenue, TherapistRevenue, PackageStats,
} from '@/types'

export const useBillingStore = defineStore('billing', () => {
  // ── State ──────────────────────────────────
  const feeSchedules = ref<FeeSchedule[]>([])
  const packages = ref<Package[]>([])
  const discounts = ref<Discount[]>([])
  const records = ref<BillingRecord[]>([])          // 付款紀錄（目前這一頁）
  const recordsTotal = ref<number | null>(null)     // 符合篩選的總筆數
  const pendingRecords = ref<BillingRecord[]>([])   // 待收款
  const clientPackages = ref<PackagePurchase[]>([]) // 個案套餐清單
  const monthlyRevenue = ref<MonthlyRevenue | null>(null)
  const therapistRevenue = ref<TherapistRevenue[]>([])
  const packageStats = ref<PackageStats | null>(null)
  const loading = ref(false)

  // ── Fee Schedules ──────────────────────────
  async function fetchFeeSchedules() {
    feeSchedules.value = await feeService.getFeeSchedules()
  }
  async function createFeeSchedule(payload: CreateFeeScheduleRequest) {
    const created = await feeService.createFeeSchedule(payload)
    feeSchedules.value.push(created)
    return created
  }
  async function updateFeeSchedule(id: number, payload: UpdateFeeScheduleRequest) {
    const updated = await feeService.updateFeeSchedule(id, payload)
    const idx = feeSchedules.value.findIndex((f) => f.id === id)
    if (idx !== -1) feeSchedules.value[idx] = updated
    return updated
  }
  async function toggleFeeSchedule(id: number, isActive: boolean) {
    await updateFeeSchedule(id, { isActive })
  }

  // ── Packages ───────────────────────────────
  async function fetchPackages() {
    packages.value = await feeService.getPackages()
  }
  async function createPackage(payload: CreatePackageRequest) {
    const created = await feeService.createPackage(payload)
    packages.value.push(created)
    return created
  }
  async function updatePackage(id: number, payload: UpdatePackageRequest) {
    const updated = await feeService.updatePackage(id, payload)
    const idx = packages.value.findIndex((p) => p.id === id)
    if (idx !== -1) packages.value[idx] = updated
    return updated
  }
  async function togglePackage(id: number, isActive: boolean) {
    await updatePackage(id, { isActive })
  }

  // ── Discounts ──────────────────────────────
  async function fetchDiscounts() {
    discounts.value = await discountService.getDiscounts()
  }
  async function createDiscount(payload: CreateDiscountRequest) {
    const created = await discountService.createDiscount(payload)
    discounts.value.push(created)
    return created
  }
  async function updateDiscount(id: number, payload: UpdateDiscountRequest) {
    const updated = await discountService.updateDiscount(id, payload)
    const idx = discounts.value.findIndex((d) => d.id === id)
    if (idx !== -1) discounts.value[idx] = updated
    return updated
  }
  async function toggleDiscount(id: number, isActive: boolean) {
    await updateDiscount(id, { isActive })
  }

  // ── Billing（付款紀錄）─────────────────────
  async function fetchRecords(params?: BillingSearchParams) {
    loading.value = true
    try {
      const result = await billingService.getRecords(params)
      records.value = result.items
      recordsTotal.value = result.totalCount
    } finally {
      loading.value = false
    }
  }
  async function fetchPending() {
    loading.value = true
    try {
      pendingRecords.value = await billingService.getPending()
    } finally {
      loading.value = false
    }
  }
  async function fetchClientPackages(params?: { clientProfileId?: number; status?: ClientPackageStatus }) {
    clientPackages.value = await billingService.getPackages(params)
  }
  function exportRecords(params?: BillingSearchParams) {
    return billingService.exportRecords(params)
  }
  async function confirmPayment(id: number, payload: ConfirmPaymentRequest) {
    await billingService.confirmPayment(id, payload)
    pendingRecords.value = pendingRecords.value.filter((r) => r.id !== id)
  }
  async function refundBilling(id: number, payload: RefundRequest = {}) {
    await billingService.refund(id, payload)
    pendingRecords.value = pendingRecords.value.filter((r) => r.id !== id)
  }
  async function waiveBilling(id: number) {
    await billingService.waive(id)
    pendingRecords.value = pendingRecords.value.filter((r) => r.id !== id)
  }
  async function purchasePackage(payload: PurchasePackageRequest) {
    return billingService.purchasePackage(payload)
  }

  // ── Reports ────────────────────────────────
  async function fetchMonthlyRevenue(year: number, month: number) {
    monthlyRevenue.value = await reportService.getMonthlyRevenue(year, month)
  }
  async function fetchRevenueByTherapist(year: number, month: number) {
    therapistRevenue.value = await reportService.getRevenueByTherapist(year, month)
  }
  async function fetchPackageStats() {
    packageStats.value = await reportService.getPackageStats()
  }

  return {
    feeSchedules, packages, discounts,
    records, recordsTotal, pendingRecords, clientPackages,
    monthlyRevenue, therapistRevenue, packageStats,
    loading,
    fetchFeeSchedules, createFeeSchedule, updateFeeSchedule, toggleFeeSchedule,
    fetchPackages, createPackage, updatePackage, togglePackage,
    fetchDiscounts, createDiscount, updateDiscount, toggleDiscount,
    fetchRecords, fetchPending, fetchClientPackages, exportRecords,
    confirmPayment, refundBilling, waiveBilling, purchasePackage,
    fetchMonthlyRevenue, fetchRevenueByTherapist, fetchPackageStats,
  }
})
