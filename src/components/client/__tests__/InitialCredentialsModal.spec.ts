import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InitialCredentialsModal from '@/components/client/InitialCredentialsModal.vue'

// D11：個案帳號的初始帳密只在建立時回傳一次，由櫃檯當場交付
describe('InitialCredentialsModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('顯示帳號與初始密碼，並提醒只會顯示一次', () => {
    mount(InitialCredentialsModal, {
      props: { credentials: { username: 'client_1_1760000000', password: 'k7Xp2mQa9z' } },
      attachTo: document.body,
    })

    expect(document.body.textContent).toContain('client_1_1760000000')
    expect(document.body.textContent).toContain('k7Xp2mQa9z')
    expect(document.body.textContent).toContain('只會顯示這一次')
  })

  it('沒有帳密時不顯示', () => {
    mount(InitialCredentialsModal, { props: { credentials: null }, attachTo: document.body })

    expect(document.body.textContent).not.toContain('初始密碼')
  })

  it('按下「我已交付」時通知關閉', async () => {
    const wrapper = mount(InitialCredentialsModal, {
      props: { credentials: { username: 'u', password: 'p' } },
      attachTo: document.body,
    })

    const button = [...document.body.querySelectorAll('button')].find((b) => b.textContent?.includes('我已交付'))
    button!.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
