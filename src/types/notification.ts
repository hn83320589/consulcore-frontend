export type NotificationChannel = 'email' | 'sms' | 'in_app'
export type NotificationEventType =
  | 'account_created'
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'therapist_leave'
  | 'series_renewal'
  | 'package_low'
  | 'package_expiring'
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'read'

export interface NotificationTemplate {
  id: number
  eventType: NotificationEventType
  channel: NotificationChannel
  subject: string
  bodyTemplate: string
  isRequired: boolean
  isActive: boolean
}

export interface CreateNotificationTemplateRequest {
  eventType: NotificationEventType
  channel?: NotificationChannel
  subject: string
  bodyTemplate: string
  isRequired: boolean
}

export interface UpdateNotificationTemplateRequest {
  subject?: string
  bodyTemplate?: string
  isActive?: boolean
}

export interface Notification {
  id: number
  channel: NotificationChannel
  subject: string
  body: string
  status: NotificationStatus
  sentAt?: string | null
  readAt?: string | null
  createdAt: string
}

export interface NotificationPreference {
  eventType: NotificationEventType
  emailEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
}

export interface UpdatePreferenceRequest {
  eventType: NotificationEventType
  emailEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
}

export interface UnreadCount {
  unreadCount: number
}

/**
 * eventType 的中文 label 與「是否為必要通知」metadata。
 *
 * PreferenceResponse（契約 7.12）已不含 eventLabel / isMandatory，因此：
 * - label 一律由此前端常數提供。
 * - required 用於「必要通知開關 disabled」的 UX 判斷（BR-12）。
 *   權威來源仍是後端：真正的 isRequired 來自 NotificationTemplateResponse.isRequired，
 *   但 GET /notification-templates 需 notification.manage policy，個案端無權限，
 *   故個案端偏好頁改用此常數；即使誤判，後端 BR-12 仍會回 400 作為最終防線。
 */
export const notificationEventMeta: Record<
  NotificationEventType,
  { label: string; required: boolean }
> = {
  // required 對齊後端 seed（DatabaseSeeder）的 isRequired 值
  account_created: { label: '帳號建立', required: true },
  appointment_created: { label: '預約成立', required: true },
  appointment_cancelled: { label: '預約取消', required: true },
  appointment_reminder: { label: '預約提醒', required: false },
  therapist_leave: { label: '諮商師請假', required: true },
  series_renewal: { label: '系列續約', required: false },
  package_low: { label: '套餐次數不足', required: false },
  package_expiring: { label: '套餐即將到期', required: false },
}
