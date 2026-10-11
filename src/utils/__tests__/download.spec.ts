import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadBlob } from '@/utils/download'

// R13：收費與稽核匯出原本各寫一份「建立暫時連結 → 觸發下載 → 釋放」
describe('downloadBlob', () => {
  afterEach(() => vi.restoreAllMocks())

  it('以指定檔名觸發下載並釋放暫時網址', () => {
    URL.createObjectURL = vi.fn(() => 'blob:fake')
    URL.revokeObjectURL = vi.fn()
    const clicked: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this)
    })

    downloadBlob(new Blob(['a,b']), 'billing-20261012.csv')

    expect(clicked).toHaveLength(1)
    expect(clicked[0]!.download).toBe('billing-20261012.csv')
    expect(clicked[0]!.href).toBe('blob:fake')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
  })
})
