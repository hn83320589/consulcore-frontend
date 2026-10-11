import { useAppointmentStore } from './appointmentStore'
import { useAuditStore } from './auditStore'
import { useBillingStore } from './billingStore'
import { useClientStore } from './clientStore'
import { useConsentStore } from './consentStore'
import { useFormBuilderStore } from './formBuilderStore'
import { useNotificationStore } from './notificationStore'
import { usePerformanceStore } from './performanceStore'
import { useScheduleStore } from './scheduleStore'
import { useSessionNoteStore } from './sessionNoteStore'
import { useStaffStore } from './staffStore'

/**
 * 清除所有「使用者資料」store（個案、晤談紀錄、收費等）。登出與切換角色時呼叫，
 * 避免下一位使用者或另一個身份看到前一份資料。authStore 自行處理、uiStore 屬介面狀態，不在此列。
 * 新增資料 store 時要加進來。
 */
export function resetUserData() {
  const stores = [
    useAppointmentStore, useAuditStore, useBillingStore, useClientStore, useConsentStore,
    useFormBuilderStore, useNotificationStore, usePerformanceStore, useScheduleStore,
    useSessionNoteStore, useStaffStore,
  ]
  for (const useStore of stores) useStore().$reset()
}
