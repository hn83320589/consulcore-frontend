import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import AppModal from '@/components/ui/AppModal.vue'

const mounted: VueWrapper[] = []

function mountModal(props: Record<string, unknown> = {}) {
  const wrapper = mount(AppModal, {
    attachTo: document.body,
    props: { open: false, title: '新增個案', ...props },
    slots: {
      default: () => [h('input', { id: 'first' }), h('input', { id: 'second' })],
      footer: () => h('button', { id: 'save' }, '儲存'),
    },
  })
  mounted.push(wrapper)
  return wrapper
}

const dialogs = () => Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'))
const pressKey = (key: string, shiftKey = false) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }))

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  document.body.innerHTML = ''
})

describe('AppModal 無障礙', () => {
  it('以 dialog 呈現，標題作為名稱', async () => {
    const wrapper = mountModal()
    await wrapper.setProps({ open: true })

    const dialog = dialogs()[0]!
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!)
    expect(title?.textContent).toBe('新增個案')
    expect(document.querySelector('button[aria-label="關閉"]')).not.toBeNull()
  })

  it('開啟時焦點移到對話框內第一個可聚焦元素，關閉後回到原本的元素', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const wrapper = mountModal()

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(dialogs()[0]!.contains(document.activeElement)).toBe(true)

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.activeElement).toBe(opener)
  })

  it('Tab 在對話框內循環，不會跑到背後的頁面', async () => {
    const wrapper = mountModal()
    await wrapper.setProps({ open: true })
    await nextTick()

    document.getElementById('save')!.focus()
    pressKey('Tab')
    const afterTab = document.activeElement
    // 第一個可聚焦元素是標題列的關閉按鈕
    document.querySelector<HTMLElement>('button[aria-label="關閉"]')!.focus()
    pressKey('Tab', true)

    expect(dialogs()[0]!.contains(afterTab)).toBe(true)
    expect(document.activeElement?.id).toBe('save')
  })

  it('兩層對話框疊開時，ESC 只關閉最上層', async () => {
    const lower = mountModal({ title: '個案詳情' })
    await lower.setProps({ open: true })
    const upper = mountModal({ title: '確認刪除' })
    await upper.setProps({ open: true })

    pressKey('Escape')

    expect(upper.emitted('close')).toHaveLength(1)
    expect(lower.emitted('close')).toBeUndefined()
  })

  it('一開始就是開啟狀態時也能用 ESC 關閉', () => {
    const wrapper = mountModal({ open: true })

    pressKey('Escape')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
