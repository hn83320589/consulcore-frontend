import { defineStore } from 'pinia'
import { ref } from 'vue'
import performanceService from '@/services/performanceService'
import violationService from '@/services/violationService'
import type {
  TherapistMetrics, MetricsSearchParams, MetricsTrend, MetricsTrendParams,
  PerformanceReview, CreatePerformanceReviewRequest,
  UpdatePerformanceReviewRequest, SetVisibilityRequest,
  ViolationRecord, CreateViolationRecordRequest,
  UpdateViolationRecordRequest, ResolveViolationRequest,
} from '@/types'

export const usePerformanceStore = defineStore('performance', () => {
  const metrics = ref<TherapistMetrics[]>([])
  const trend = ref<MetricsTrend | null>(null)
  const reviews = ref<PerformanceReview[]>([])
  const violations = ref<ViolationRecord[]>([])
  const loading = ref(false)

  // ── Metrics ──
  // 單一心理師（回單一物件，包成陣列供 MetricsCard 顯示）
  async function fetchMetrics(therapistUserId: number, params: MetricsSearchParams) {
    loading.value = true
    try { metrics.value = [await performanceService.getMetrics(therapistUserId, params)] }
    finally { loading.value = false }
  }
  // 全機構比較
  async function fetchComparison(params: MetricsSearchParams) {
    loading.value = true
    try { metrics.value = await performanceService.getComparison(params) }
    finally { loading.value = false }
  }
  // 單一指標時間趨勢
  async function fetchMetricsTrend(therapistUserId: number, params: MetricsTrendParams) {
    trend.value = await performanceService.getMetricsTrend(therapistUserId, params)
  }

  // ── Reviews ──
  async function fetchReviews() {
    reviews.value = await performanceService.getReviews()
  }
  async function fetchReviewsByTherapist(therapistUserId: number) {
    reviews.value = await performanceService.getReviewsByTherapist(therapistUserId)
  }
  async function createReview(payload: CreatePerformanceReviewRequest) {
    const created = await performanceService.createReview(payload)
    reviews.value.unshift(created)
    return created
  }
  async function updateReview(id: number, payload: UpdatePerformanceReviewRequest) {
    const updated = await performanceService.updateReview(id, payload)
    replaceReview(updated)
    return updated
  }
  async function deleteReview(id: number) {
    await performanceService.deleteReview(id)
    reviews.value = reviews.value.filter((r) => r.id !== id)
  }
  async function setVisibility(id: number, payload: SetVisibilityRequest) {
    const updated = await performanceService.setVisibility(id, payload)
    replaceReview(updated)
    return updated
  }
  function replaceReview(review: PerformanceReview) {
    const idx = reviews.value.findIndex((r) => r.id === review.id)
    if (idx !== -1) reviews.value[idx] = review
  }

  // ── Violations ──
  async function fetchViolations() {
    violations.value = await violationService.getViolations()
  }
  async function createViolation(payload: CreateViolationRecordRequest) {
    const created = await violationService.createViolation(payload)
    violations.value.unshift(created)
    return created
  }
  async function updateViolation(id: number, payload: UpdateViolationRecordRequest) {
    const updated = await violationService.updateViolation(id, payload)
    replaceViolation(updated)
    return updated
  }
  async function resolveViolation(id: number, payload: ResolveViolationRequest) {
    const updated = await violationService.resolveViolation(id, payload)
    replaceViolation(updated)
    return updated
  }
  async function dismissViolation(id: number) {
    const updated = await violationService.dismissViolation(id)
    replaceViolation(updated)
    return updated
  }
  async function deleteViolation(id: number) {
    await violationService.deleteViolation(id)
    violations.value = violations.value.filter((v) => v.id !== id)
  }
  function replaceViolation(violation: ViolationRecord) {
    const idx = violations.value.findIndex((v) => v.id === violation.id)
    if (idx !== -1) violations.value[idx] = violation
  }

  return {
    metrics, trend, reviews, violations, loading,
    fetchMetrics, fetchComparison, fetchMetricsTrend,
    fetchReviews, fetchReviewsByTherapist, createReview, updateReview, deleteReview, setVisibility,
    fetchViolations, createViolation, updateViolation, resolveViolation, dismissViolation, deleteViolation,
  }
})
