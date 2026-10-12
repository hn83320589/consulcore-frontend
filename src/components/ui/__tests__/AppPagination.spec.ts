import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppPagination from '@/components/ui/AppPagination.vue'

const buttons = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('button')
const prev = (wrapper: ReturnType<typeof mount>) => buttons(wrapper)[0]!
const next = (wrapper: ReturnType<typeof mount>) => { const all = buttons(wrapper); return all[all.length - 1]! }

describe('AppPagination', () => {
  it('知道總筆數時顯示總頁數與頁碼', () => {
    const wrapper = mount(AppPagination, { props: { page: 2, pageSize: 50, totalCount: 120, itemCount: 50 } })

    expect(wrapper.text()).toContain('共 120 筆，第 2/3 頁')
    expect(buttons(wrapper).map((b) => b.text())).toEqual(['←', '1', '2', '3', '→'])
  })

  it('第一頁不能往前、最後一頁不能往後', () => {
    const first = mount(AppPagination, { props: { page: 1, pageSize: 50, totalCount: 120, itemCount: 50 } })
    const last = mount(AppPagination, { props: { page: 3, pageSize: 50, totalCount: 120, itemCount: 20 } })

    expect(prev(first).attributes('disabled')).toBeDefined()
    expect(next(last).attributes('disabled')).toBeDefined()
  })

  it('點頁碼或箭頭送出 update:page', async () => {
    const wrapper = mount(AppPagination, { props: { page: 2, pageSize: 50, totalCount: 120, itemCount: 50 } })

    await next(wrapper).trigger('click')
    await buttons(wrapper)[1]!.trigger('click')

    expect(wrapper.emitted('update:page')).toEqual([[3], [1]])
  })

  it('只有一頁時不顯示', () => {
    const wrapper = mount(AppPagination, { props: { page: 1, pageSize: 50, totalCount: 10, itemCount: 10 } })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('總筆數未知（舊後端）：本頁筆數等於每頁上限才可往下一頁', () => {
    const full = mount(AppPagination, { props: { page: 1, pageSize: 50, totalCount: null, itemCount: 50 } })
    const partial = mount(AppPagination, { props: { page: 2, pageSize: 50, totalCount: null, itemCount: 20 } })

    expect(full.text()).toContain('第 1 頁')
    expect(next(full).attributes('disabled')).toBeUndefined()
    expect(next(partial).attributes('disabled')).toBeDefined()
    expect(buttons(partial).map((b) => b.text())).toEqual(['←', '→'])
  })

  it('停用時所有按鈕都不能點', () => {
    const wrapper = mount(AppPagination, { props: { page: 2, pageSize: 50, totalCount: 120, itemCount: 50, disabled: true } })

    expect(buttons(wrapper).every((b) => b.attributes('disabled') !== undefined)).toBe(true)
  })
})
