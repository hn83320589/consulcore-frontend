import httpService from './httpService'
import type {
  TherapistMetrics, MetricsSearchParams, MetricsTrend, MetricsTrendParams,
  PerformanceReview, CreatePerformanceReviewRequest,
  UpdatePerformanceReviewRequest, SetVisibilityRequest,
} from '@/types'

const performanceService = {
  // ── Reviews ──
  getReviews(): Promise<PerformanceReview[]> {
    return httpService.get<PerformanceReview[]>('/performance-reviews')
  },
  getReviewsByTherapist(therapistUserId: number): Promise<PerformanceReview[]> {
    return httpService.get<PerformanceReview[]>(`/performance-reviews/by-therapist/${therapistUserId}`)
  },
  createReview(payload: CreatePerformanceReviewRequest): Promise<PerformanceReview> {
    return httpService.post<PerformanceReview>('/performance-reviews', payload)
  },
  updateReview(id: number, payload: UpdatePerformanceReviewRequest): Promise<PerformanceReview> {
    return httpService.put<PerformanceReview>(`/performance-reviews/${id}`, payload)
  },
  deleteReview(id: number): Promise<void> {
    return httpService.delete<void>(`/performance-reviews/${id}`)
  },
  setVisibility(id: number, payload: SetVisibilityRequest): Promise<PerformanceReview> {
    return httpService.put<PerformanceReview>(`/performance-reviews/${id}/visibility`, payload)
  },

  // ── Metrics ──
  // 單一心理師量化指標（回單一 TherapistMetrics）
  getMetrics(therapistUserId: number, params: MetricsSearchParams): Promise<TherapistMetrics> {
    return httpService.get<TherapistMetrics>(`/performance-reviews/metrics/${therapistUserId}`, { params })
  },
  // 全機構比較（回 TherapistMetrics[]）
  getComparison(params: MetricsSearchParams): Promise<TherapistMetrics[]> {
    return httpService.get<TherapistMetrics[]>('/performance-reviews/metrics-comparison', { params })
  },
  // 單一指標的時間趨勢
  getMetricsTrend(therapistUserId: number, params: MetricsTrendParams): Promise<MetricsTrend> {
    return httpService.get<MetricsTrend>(`/performance-reviews/metrics/${therapistUserId}/trend`, { params })
  },
}

export default performanceService
