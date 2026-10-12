import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import type { NotificationTemplate } from '@/types'

// 「必要」欄只有 v-if：非必要時 slot 沒有內容，Vue 改顯示 AppTable 的預設內容（原始值 false）
vi.mock('@/services/notificationService', () => ({
  default: { getTemplates: vi.fn() },
}))

const { default: notificationService } = await import('@/services/notificationService')
const { default: NotificationTemplateView } = await import('@/views/admin/NotificationTemplateView.vue')

function template(id: number, isRequired: boolean): NotificationTemplate {
  return {
    id, eventType: 'appointment_reminder', channel: 'in_app', subject: `主旨${id}`, bodyTemplate: '',
    isRequired, isActive: true,
  } as NotificationTemplate
}

describe('NotificationTemplateView 必要欄', () => {
  it('非必要的範本不顯示 false', async () => {
    setUpTestPinia()
    vi.mocked(notificationService.getTemplates).mockResolvedValue([template(1, true), template(2, false)])

    const wrapper = mount(NotificationTemplateView)
    await flushPromises()

    expect(wrapper.text()).not.toContain('false')
    expect(wrapper.text()).toContain('必要')
  })
})
