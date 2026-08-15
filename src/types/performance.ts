export type ReviewVisibility = 'hidden' | 'visible'
export type ViolationStatus = 'open' | 'resolved' | 'dismissed'
export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical'

// 量化指標（8 項 metric + 2 識別欄位），對應後端 TherapistMetrics
export interface TherapistMetrics {
  therapistUserId: number
  therapistName: string
  appointmentCompletionRate: number // 預約完成率 %
  noShowRate: number                // 未到率 %
  avgNoteDelayHours: number         // 紀錄及時性（晤談後平均時差，小時）
  noteLockRate: number              // 紀錄鎖定率 %
  clientRetentionRate: number       // 個案留存率 %
  monthlySessionCount: number       // 月諮商次數
  monthlySessionHours: number       // 月諮商時數
  paymentCompletionRate: number     // 收費完成率 %
}

// 對應後端 PerformanceReviewResponse
export interface PerformanceReview {
  id: number
  therapistUserId: number
  therapistName: string
  reviewerId: number
  reviewerName: string
  period: string
  professionalScore: number       // 1-5
  clientFeedbackScore: number     // 1-5
  teamworkScore: number           // 1-5
  overallScore: number            // 1-5
  comment?: string | null         // BR-18：非 Owner 檢視時後端回 null
  visibility: ReviewVisibility
  visibleFrom?: string | null
  visibleUntil?: string | null
  createdAt: string
}

export interface CreatePerformanceReviewRequest {
  therapistUserId: number
  period: string
  professionalScore: number       // 1-5
  clientFeedbackScore: number     // 1-5
  teamworkScore: number           // 1-5
  overallScore: number            // 1-5
  comment?: string | null
}

export interface UpdatePerformanceReviewRequest {
  professionalScore?: number | null
  clientFeedbackScore?: number | null
  teamworkScore?: number | null
  overallScore?: number | null
  comment?: string | null
}

export interface SetVisibilityRequest {
  visibility: ReviewVisibility
  visibleFrom?: string | null
  visibleUntil?: string | null
}

// 對應後端 ViolationRecordResponse
export interface ViolationRecord {
  id: number
  therapistUserId: number
  therapistName: string
  reportedBy: number
  incidentDate: string
  severity: ViolationSeverity
  description: string
  actionTaken?: string | null
  status: ViolationStatus
  resolvedAt?: string | null
  createdAt: string
}

export interface CreateViolationRecordRequest {
  therapistUserId: number
  incidentDate: string
  severity?: ViolationSeverity
  description: string
  actionTaken?: string | null
}

export interface UpdateViolationRecordRequest {
  severity?: ViolationSeverity | null
  description?: string | null
  actionTaken?: string | null
}

export interface ResolveViolationRequest {
  actionTaken: string
}

// metrics 查詢區間（startDate / endDate 必填）
export interface MetricsSearchParams {
  startDate: string
  endDate: string
}

// 單一指標的時間趨勢，對應後端 MetricsTrend
export interface MetricsTrend {
  metric: string                              // 指標鍵，如 'appointmentCompletionRate'
  points: { period: string; value: number }[] // period 為 "yyyy-MM"
}

// metrics trend 查詢參數（metric / startDate / endDate 必填；interval 目前僅 'month'）
export interface MetricsTrendParams {
  metric: string
  startDate: string
  endDate: string
  interval?: 'month'
}
