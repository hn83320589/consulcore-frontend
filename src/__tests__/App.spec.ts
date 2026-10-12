import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import App from '@/App.vue'

describe('全域提示訊息', () => {
  // 區域要在訊息出現前就存在，報讀器才會唸出之後加入的訊息
  it('提示區域以 aria-live 讓報讀器唸出新訊息', () => {
    setUpTestPinia()
    const wrapper = mount(App, { global: { stubs: { 'router-view': true, Teleport: true } } })

    const region = wrapper.get('[aria-live]')
    expect(region.attributes('aria-live')).toBe('polite')
    expect(region.attributes('role')).toBe('status')
  })
})
