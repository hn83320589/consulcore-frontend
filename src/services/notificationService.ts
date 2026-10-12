import httpService from './httpService'
import type {
  NotificationTemplate, CreateNotificationTemplateRequest, UpdateNotificationTemplateRequest,
  Notification, NotificationPreference, UpdatePreferenceRequest, UnreadCount,
} from '@/types'
import { toPage, requestedPage, type Page, type PagedResponse } from '@/utils/paging'

const notificationService = {
  // Templates
  getTemplates(): Promise<NotificationTemplate[]> {
    return httpService.get<NotificationTemplate[]>('/notification-templates')
  },
  createTemplate(payload: CreateNotificationTemplateRequest): Promise<NotificationTemplate> {
    return httpService.post<NotificationTemplate>('/notification-templates', payload)
  },
  updateTemplate(id: number, payload: UpdateNotificationTemplateRequest): Promise<NotificationTemplate> {
    return httpService.put<NotificationTemplate>(`/notification-templates/${id}`, payload)
  },
  deleteTemplate(id: number): Promise<void> {
    return httpService.delete<void>(`/notification-templates/${id}`)
  },

  // Notifications
  async getNotifications(params?: { page?: number; pageSize?: number }): Promise<Page<Notification>> {
    const data = await httpService.get<Notification[] | PagedResponse<Notification>>('/notifications', { params })
    return toPage(data, requestedPage(params))
  },
  getUnreadCount(): Promise<UnreadCount> {
    return httpService.get<UnreadCount>('/notifications/unread-count')
  },
  markAsRead(id: number): Promise<void> {
    return httpService.post<void>(`/notifications/${id}/mark-read`)
  },
  markAllAsRead(): Promise<void> {
    return httpService.post<void>('/notifications/mark-all-read')
  },

  // Preferences
  getPreferences(): Promise<NotificationPreference[]> {
    return httpService.get<NotificationPreference[]>('/notification-preferences')
  },
  updatePreference(payload: UpdatePreferenceRequest): Promise<void> {
    return httpService.put<void>('/notification-preferences', payload)
  },
}

export default notificationService
