import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'

// 排班、預約、考核頁原本要手動輸入心理師 ID
vi.mock('@/services/staffService', () => ({
  default: { getTherapistOptions: vi.fn() },
}))

const { default: staffService } = await import('@/services/staffService')
const { useUiStore } = await import('@/stores/uiStore')
const { useTherapistOptions } = await import('@/composables/useTherapistOptions')

let result: ReturnType<typeof useTherapistOptions>

async function mountUsing() {
  setUpTestPinia()
  const wrapper = mount(defineComponent({
    setup() {
      result = useTherapistOptions()
      return () => h('div')
    },
  }))
  await flushPromises()
  return wrapper
}

describe('useTherapistOptions', () => {
  afterEach(() => vi.clearAllMocks())

  it('載入後轉成下拉選單選項（value 為字串 id）', async () => {
    vi.mocked(staffService.getTherapistOptions).mockResolvedValue([
      { id: 3, displayName: '陳心理師' },
      { id: 7, displayName: '林心理師' },
    ])

    await mountUsing()

    expect(result.options.value).toEqual([
      { label: '陳心理師', value: '3' },
      { label: '林心理師', value: '7' },
    ])
  })

  it('載入失敗時提示使用者，選項為空', async () => {
    vi.mocked(staffService.getTherapistOptions).mockRejectedValue(new Error('network'))

    await mountUsing()

    expect(result.options.value).toEqual([])
    expect(useUiStore().toasts[0]?.message).toBe('無法載入心理師清單')
  })
})
