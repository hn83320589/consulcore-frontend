import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '@/components/ui/AppInput.vue'

describe('AppInput 無障礙', () => {
  it('label 與輸入框關聯（點 label 會聚焦輸入框、報讀器會唸出欄位名稱）', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', label: '姓名' } })

    const input = wrapper.get('input')
    expect(input.attributes('id')).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
  })

  it('有錯誤時標示 aria-invalid，並以 aria-describedby 指向錯誤訊息', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', label: '姓名', error: '必填' } })

    const input = wrapper.get('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get(`#${input.attributes('aria-describedby')}`).text()).toBe('必填')
  })

  it('沒有錯誤時不標示', () => {
    const input = mount(AppInput, { props: { modelValue: '', label: '姓名' } }).get('input')

    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(input.attributes('aria-describedby')).toBeUndefined()
  })
})
