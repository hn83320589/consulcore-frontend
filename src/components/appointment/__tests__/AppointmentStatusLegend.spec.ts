import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppointmentStatusLegend from '@/components/appointment/AppointmentStatusLegend.vue'

// 預約行事曆以顏色區分狀態（灰 = 已完成、紅 = 已取消），原本沒有圖例
describe('AppointmentStatusLegend', () => {
  it('每個狀態一個色塊，顏色與行事曆事件用同一組 CSS 變數', () => {
    const wrapper = mount(AppointmentStatusLegend)

    expect(wrapper.text()).toContain('已排定')
    expect(wrapper.text()).toContain('已取消')
    const swatches = wrapper.findAll('[data-status]')
    expect(swatches).toHaveLength(4)
    expect(swatches[0]!.attributes('style')).toContain('var(--color-status-scheduled)')
  })
})
