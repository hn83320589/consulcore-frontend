import type { Schemas } from './schema'

export type ReviewVisibility = Schemas['PerformanceReviewResponseDto']['visibility']
export type ViolationStatus = Schemas['ViolationRecordResponseDto']['status']
export type ViolationSeverity = Schemas['ViolationRecordResponseDto']['severity']

// 量化指標（8 項 metric + 2 識別欄位），對應後端 TherapistMetrics
export type TherapistMetrics = Schemas['TherapistMetricsDto']

// 對應後端 PerformanceReviewResponse
export type PerformanceReview = Schemas['PerformanceReviewResponseDto']

export type CreatePerformanceReviewRequest = Schemas['CreatePerformanceReviewDto']

export type UpdatePerformanceReviewRequest = Schemas['UpdatePerformanceReviewDto']

export type SetVisibilityRequest = Schemas['SetVisibilityDto']

// 對應後端 ViolationRecordResponse
export type ViolationRecord = Schemas['ViolationRecordResponseDto']

export type CreateViolationRecordRequest = Schemas['CreateViolationRecordDto']

export type UpdateViolationRecordRequest = Schemas['UpdateViolationRecordDto']

export type ResolveViolationRequest = Schemas['ResolveViolationDto']

// metrics 查詢區間（startDate / endDate 必填）
export interface MetricsSearchParams {
  startDate: string
  endDate: string
}

// 單一指標的時間趨勢，對應後端 MetricsTrend
export type MetricsTrend = Schemas['MetricsTrendDto']

// metrics trend 查詢參數（metric / startDate / endDate 必填；interval 目前僅 'month'）
export interface MetricsTrendParams {
  metric: string
  startDate: string
  endDate: string
  interval?: 'month'
}
