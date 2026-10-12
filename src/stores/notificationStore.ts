import { defineStore } from 'pinia'
import { ref } from 'vue'
import notificationService from '@/services/notificationService'
import type {
  NotificationTemplate, UpdateNotificationTemplateRequest,
  Notification, NotificationPreference, UpdatePreferenceRequest,
} from '@/types'

export const useNotificationStore = defineStore('notification', () => {
  const templates = ref<NotificationTemplate[]>([])
  const notifications = ref<Notification[]>([])
  const notificationsTotal = ref(0)
  const preferences = ref<NotificationPreference[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  // Templates
  async function fetchTemplates() {
    templates.value = await notificationService.getTemplates()
  }
  async function updateTemplate(id: number, payload: UpdateNotificationTemplateRequest) {
    const updated = await notificationService.updateTemplate(id, payload)
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx !== -1) templates.value[idx] = updated
    return updated
  }

  // Notifications
  async function fetchNotifications(params?: { page?: number; pageSize?: number }) {
    loading.value = true
    try {
      const result = await notificationService.getNotifications(params)
      notifications.value = result.items
      notificationsTotal.value = result.totalCount
    }
    finally { loading.value = false }
  }
  async function fetchUnreadCount() {
    const res = await notificationService.getUnreadCount()
    unreadCount.value = res.unreadCount
  }
  async function markAsRead(id: number) {
    await notificationService.markAsRead(id)
    const n = notifications.value.find((n) => n.id === id)
    if (n && n.status !== 'read') {
      n.status = 'read'
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }
  async function markAllAsRead() {
    await notificationService.markAllAsRead()
    notifications.value.forEach((n) => { n.status = 'read' })
    unreadCount.value = 0
  }

  // Preferences
  async function fetchPreferences() {
    preferences.value = await notificationService.getPreferences()
  }
  async function updatePreference(payload: UpdatePreferenceRequest) {
    await notificationService.updatePreference(payload)
    const pref = preferences.value.find((p) => p.eventType === payload.eventType)
    if (pref) {
      pref.emailEnabled = payload.emailEnabled
      pref.smsEnabled = payload.smsEnabled
      pref.inAppEnabled = payload.inAppEnabled
    }
  }

  return {
    templates, notifications, notificationsTotal, preferences, unreadCount, loading,
    fetchTemplates, updateTemplate,
    fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead,
    fetchPreferences, updatePreference,
  }
})
