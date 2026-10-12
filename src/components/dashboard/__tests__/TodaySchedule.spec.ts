import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TodaySchedule from '@/components/dashboard/TodaySchedule.vue'
import type { Appointment } from '@/types'

const appointments = [
  { id: 1, startTime: '09:00', endTime: '09:50', clientName: '李品妤', therapistName: '陳怡君', roomName: '晨曦室', status: 'completed' },
  { id: 2, startTime: '14:00', endTime: '14:50', clientName: '周柏宇', therapistName: '林志豪', roomName: null, status: 'scheduled' },
] as unknown as Appointment[]

describe('TodaySchedule', () => {
  it('列出時間、個案、狀態；擁有者版本另列心理師', () => {
    const wrapper = mount(TodaySchedule, { props: { appointments, showTherapist: true } })

    const rows = wrapper.findAll('li').map((li) => li.text())
    expect(rows[0]).toContain('09:00 - 09:50')
    expect(rows[0]).toContain('李品妤')
    expect(rows[0]).toContain('陳怡君')
    expect(rows[0]).toContain('已完成')
    expect(rows[1]).toContain('已排定')
  })

  it('心理師版本不重複顯示自己的名字', () => {
    const wrapper = mount(TodaySchedule, { props: { appointments } })

    expect(wrapper.text()).not.toContain('陳怡君')
  })

  it('沒有預約時顯示提示', () => {
    const wrapper = mount(TodaySchedule, { props: { appointments: [] } })

    expect(wrapper.text()).toContain('今日尚無預約')
  })
})
