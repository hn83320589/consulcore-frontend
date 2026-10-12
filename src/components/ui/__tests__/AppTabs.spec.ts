import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import AppTabs from '@/components/ui/AppTabs.vue'

const tabs = [
  { key: 'info', label: '基本資料' },
  { key: 'notes', label: '晤談紀錄' },
  { key: 'billing', label: '收費' },
]

const mountTabs = (modelValue = 'notes') =>
  mount(AppTabs, { attachTo: document.body, props: { tabs, modelValue }, slots: { default: () => h('p', '內容') } })

describe('AppTabs 無障礙', () => {
  it('以 tablist / tab / tabpanel 呈現，標出目前的分頁', () => {
    const wrapper = mountTabs()

    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    const tabEls = wrapper.findAll('[role="tab"]')
    expect(tabEls.map((t) => t.attributes('aria-selected'))).toEqual(['false', 'true', 'false'])
    // 只有目前的分頁可用 Tab 鍵進入，其餘用方向鍵切換
    expect(tabEls.map((t) => t.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
    const panel = wrapper.get('[role="tabpanel"]')
    expect(panel.attributes('aria-labelledby')).toBe(tabEls[1]!.attributes('id'))
    wrapper.unmount()
  })

  it.each([
    ['ArrowRight', 'billing'],
    ['ArrowLeft', 'info'],
    ['Home', 'info'],
    ['End', 'billing'],
  ])('%s 切換到 %s', async (key, expected) => {
    const wrapper = mountTabs()

    await wrapper.findAll('[role="tab"]')[1]!.trigger('keydown', { key })

    expect(wrapper.emitted('update:modelValue')).toEqual([[expected]])
    wrapper.unmount()
  })

  it('方向鍵在頭尾循環', async () => {
    const wrapper = mountTabs('billing')

    await wrapper.findAll('[role="tab"]')[2]!.trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['info']])
    wrapper.unmount()
  })
})
