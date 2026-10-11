import { describe, expect, it } from 'vitest'
import { toLocalDateString } from '@/utils/date'

// F2：toISOString() 輸出 UTC，在 UTC+8 會把本地的日期往前推一天
describe('toLocalDateString', () => {
  it('測試環境時區為 Asia/Taipei（UTC+8）', () => {
    expect(new Date(2026, 9, 31).getTimezoneOffset()).toBe(-480)
  })

  it('月底的本地午夜仍是當天（toISOString 會變成前一天）', () => {
    const monthEnd = new Date(2026, 10, 0) // 2026-10-31 00:00 本地

    // eslint-disable-next-line no-restricted-syntax -- 刻意示範舊寫法的錯誤結果
    expect(monthEnd.toISOString().slice(0, 10)).toBe('2026-10-30')
    expect(toLocalDateString(monthEnd)).toBe('2026-10-31')
  })

  it('月初的本地午夜仍是當月 1 號', () => {
    expect(toLocalDateString(new Date(2026, 9, 1))).toBe('2026-10-01')
  })

  it('早上 8 點前的「今天」不會變成昨天', () => {
    expect(toLocalDateString(new Date(2026, 9, 11, 7, 59))).toBe('2026-10-11')
  })

  it('月、日補零', () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
