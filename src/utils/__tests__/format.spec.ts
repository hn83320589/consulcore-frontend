import { describe, expect, it } from 'vitest'
import {
  formatCurrency, formatDate, formatDateTime, formatDateWithYear, formatDayWithWeekday, formatShortDateTime,
} from '@/utils/format'

// R13：原本 13 份 formatDate（8 種寫法）、3 份 formatCurrency 散在各元件；時區固定 Asia/Taipei
const iso = '2026-10-12T06:30:00Z' // 台北 10/12 14:30

describe('format', () => {
  it('formatDate：日期', () => {
    expect(formatDate(iso)).toBe('2026/10/12')
  })

  it('formatDateTime：日期與時間', () => {
    // ICU 在日期與時間之間可能用特殊空白（依版本不同），以 \s 比對
    expect(formatDateTime(iso)).toMatch(/^2026\/10\/12\s下午2:30:00$/)
  })

  it('formatShortDateTime：月日與時分', () => {
    expect(formatShortDateTime(iso)).toBe('10月12日 下午02:30')
  })

  it('formatDayWithWeekday：預約日期（星期與月份格式可選）', () => {
    expect(formatDayWithWeekday(iso)).toBe('10月12日週一')
    expect(formatDayWithWeekday(iso, 'long')).toBe('10月12日星期一')
  })

  it('formatDateWithYear：含年份', () => {
    expect(formatDateWithYear(iso)).toBe('2026年10月12日')
  })

  it.each([null, undefined, ''])('空值一律顯示 —（%s）', (empty) => {
    expect(formatDate(empty)).toBe('—')
    expect(formatDateTime(empty)).toBe('—')
    expect(formatShortDateTime(empty)).toBe('—')
  })

  it('formatCurrency：千分位與 $', () => {
    expect(formatCurrency(1200)).toBe('$1,200')
    expect(formatCurrency(0)).toBe('$0')
  })
})
