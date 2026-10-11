import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ClientSessionsTab from '@/components/client/detail/ClientSessionsTab.vue'
import ClientBillingTab from '@/components/client/detail/ClientBillingTab.vue'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

// R15：ClientDetailView（600 行）拆出的分頁元件；只顯示目前個案的資料
describe('ClientSessionsTab', () => {
  const pinia = () => createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      sessionNote: {
        notes: [
          { id: 1, clientProfileId: 3, createdAt: '2026-10-01T02:00:00Z', type: 'session', format: 'soap', soapS: '主述 A', isLocked: false },
          { id: 2, clientProfileId: 3, createdAt: '2026-10-08T02:00:00Z', type: 'closure', format: 'free_text', freeTextContent: '結案', isLocked: true },
          { id: 3, clientProfileId: 9, createdAt: '2026-10-09T02:00:00Z', type: 'session', format: 'soap', isLocked: false },
        ],
      },
    },
  })

  it('只列出這位個案的紀錄，新的在前', () => {
    const wrapper = mount(ClientSessionsTab, { props: { clientId: 3 }, global: { plugins: [pinia()] } })

    const dates = wrapper.findAll('button span.text-gray-600.font-medium').map((s) => s.text())
    expect(dates).toEqual(['2026年10月8日', '2026年10月1日'])
  })

  it('點擊後展開紀錄內容', async () => {
    const wrapper = mount(ClientSessionsTab, { props: { clientId: 3 }, global: { plugins: [pinia()] } })

    expect(wrapper.text()).not.toContain('主述 A')
    await wrapper.findAll('button').find((b) => b.text().includes('2026年10月1日'))!.trigger('click')
    expect(wrapper.text()).toContain('主述 A')
  })
})

describe('ClientBillingTab', () => {
  it('計算這位個案的待收款與付款筆數', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        billing: {
          records: [
            { id: 1, clientProfileId: 3, createdAt: '2026-10-01T02:00:00Z', status: 'pending', originalAmount: 2000, finalAmount: 1800 },
            { id: 2, clientProfileId: 3, createdAt: '2026-10-02T02:00:00Z', status: 'paid', originalAmount: 2000, finalAmount: 2000 },
            { id: 3, clientProfileId: 9, createdAt: '2026-10-03T02:00:00Z', status: 'pending', originalAmount: 500, finalAmount: 500 },
          ],
          clientPackages: [],
        },
      },
    })

    const wrapper = mount(ClientBillingTab, { props: { clientId: 3 }, global: { plugins: [pinia] } })

    expect(wrapper.text()).toContain('$1,800')
    expect(wrapper.text()).toContain('2 筆')
    expect(wrapper.text()).toContain('尚無套餐')
  })
})
