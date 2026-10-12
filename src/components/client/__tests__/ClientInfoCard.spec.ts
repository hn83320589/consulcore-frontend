import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ClientInfoCard from '@/components/client/ClientInfoCard.vue'
import type { ClientProfile } from '@/types'

const client = {
  id: 1, name: '李品妤', gender: 'female', idNumber: 'A123456789', dateOfBirth: '1996-03-12',
  status: 'active', createdAt: '', updatedAt: '', mustChangePassword: false,
} as unknown as ClientProfile

const valueOf = (w: ReturnType<typeof mount>, label: string) =>
  w.findAll('p').find((p) => p.text() === label)!.element.nextElementSibling!.textContent!.trim()

describe('ClientInfoCard', () => {
  // 原本顯示代碼 female
  it('性別顯示中文', () => {
    const wrapper = mount(ClientInfoCard, { props: { client } })

    expect(valueOf(wrapper, '性別')).toBe('女')
  })

  // 身分證字號原本完整顯示；個案資料常在櫃檯、會談室螢幕上打開
  it('身分證字號預設遮蔽，按「顯示」才看得到完整號碼', async () => {
    const wrapper = mount(ClientInfoCard, { props: { client } })

    expect(wrapper.text()).not.toContain('A123456789')
    expect(wrapper.text()).toContain('A******789')

    await wrapper.findAll('button').find((b) => b.text() === '顯示')!.trigger('click')

    expect(wrapper.text()).toContain('A123456789')
  })
})
