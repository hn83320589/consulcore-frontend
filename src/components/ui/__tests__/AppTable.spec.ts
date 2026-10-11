import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import AppTable from '@/components/ui/AppTable.vue'

interface Client {
  id: number
  name: string
}

const columns = [
  { key: 'id', label: '編號' },
  { key: 'name', label: '姓名' },
]
const clients = (n: number): Client[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `個案${i + 1}` }))

// R14：AppTable 改為泛型前，先鎖住顯示、空狀態、分頁與 slot 行為
describe('AppTable', () => {
  it('依欄位顯示每一列', () => {
    const wrapper = mount(AppTable, { props: { columns, data: clients(2) } })

    const rows = wrapper.findAll('tbody tr').map((r) => r.findAll('td').map((c) => c.text()))
    expect(rows).toEqual([['1', '個案1'], ['2', '個案2']])
  })

  it('沒有資料時顯示空狀態', () => {
    const wrapper = mount(AppTable, { props: { columns, data: [] as Client[], emptyText: '尚無個案' } })

    expect(wrapper.text()).toContain('尚無個案')
  })

  it('超過一頁時分頁', async () => {
    const wrapper = mount(AppTable, { props: { columns, data: clients(20), pageSize: 15 } })

    expect(wrapper.findAll('tbody tr')).toHaveLength(15)
    expect(wrapper.text()).toContain('共 20 筆，第 1/2 頁')
    const buttons = wrapper.findAll('button')
    await buttons[buttons.length - 1]!.trigger('click')
    expect(wrapper.findAll('tbody tr')).toHaveLength(5)
  })

  it('自訂欄位 slot 拿到整列資料', () => {
    const wrapper = mount(AppTable, {
      props: { columns, data: clients(1) },
      // mount 無法推斷泛型參數，slot 收到的 row 在此為 object
      slots: { 'cell-name': ({ row }: { row: object }) => h('b', `${(row as Client).name}#${(row as Client).id}`) },
    })

    expect(wrapper.find('b').text()).toBe('個案1#1')
  })
})
