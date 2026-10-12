import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ClientAuditTab from '@/components/client/detail/ClientAuditTab.vue'
import type { AuditLog } from '@/types'

// 動作原本直接顯示代碼 view / create
describe('ClientAuditTab', () => {
  it('動作顯示中文', () => {
    const logs = [
      { id: 1, action: 'view', resourceType: 'client_profile', userName: '王曉晴', description: '檢視個案 #1', createdAt: '2026-10-12T06:00:00Z' },
    ] as unknown as AuditLog[]

    const wrapper = mount(ClientAuditTab, { props: { logs } })

    expect(wrapper.text()).toContain('檢視')
    expect(wrapper.text()).not.toContain('view')
  })
})
