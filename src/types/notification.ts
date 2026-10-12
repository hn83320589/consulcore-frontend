import type { Schemas } from './schema'

export type NotificationChannel = Schemas['NotificationLogResponseDto']['channel']
export type NotificationEventType = Schemas['NotificationTemplateResponseDto']['eventType']
export type NotificationStatus = Schemas['NotificationLogResponseDto']['status']

export type NotificationTemplate = Schemas['NotificationTemplateResponseDto']

export type CreateNotificationTemplateRequest = Schemas['CreateNotificationTemplateDto']

export type UpdateNotificationTemplateRequest = Schemas['UpdateNotificationTemplateDto']

export type Notification = Schemas['NotificationLogResponseDto']

export type NotificationPreference = Schemas['PreferenceResponseDto']

// 後端三個開關省略時預設 true；前端一律送齊，store 更新本地狀態時依賴這點
export type UpdatePreferenceRequest = Required<Schemas['UpdatePreferenceDto']>

export type UnreadCount = Schemas['UnreadCountDto']

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
