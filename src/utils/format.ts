// 畫面顯示用的日期與金額格式（zh-TW）。空值一律顯示「—」。
// 送給後端的日期字串請用 utils/date 的 toLocalDateString。

type DateInput = string | Date | null | undefined

const EMPTY = '—'

function toDate(value: DateInput): Date | null {
  if (value == null || value === '') return null
  return value instanceof Date ? value : new Date(value)
}

/** 2026/10/12 */
export function formatDate(value: DateInput): string {
  return toDate(value)?.toLocaleDateString('zh-TW') ?? EMPTY
}

/** 2026/10/12 下午2:30:00 */
export function formatDateTime(value: DateInput): string {
  return toDate(value)?.toLocaleString('zh-TW') ?? EMPTY
}

/** 10月12日 下午02:30 */
export function formatShortDateTime(value: DateInput): string {
  return toDate(value)?.toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) ?? EMPTY
}

/** 10月12日週一（weekday: 'long' → 10月12日星期一） */
export function formatDayWithWeekday(value: DateInput, weekday: 'short' | 'long' = 'short'): string {
  return toDate(value)?.toLocaleDateString('zh-TW', { weekday, month: 'long', day: 'numeric' }) ?? EMPTY
}

/** 2026年10月12日 */
export function formatDateWithYear(value: DateInput): string {
  return toDate(value)?.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' }) ?? EMPTY
}

/** $1,200 */
export function formatCurrency(amount: number | string | null | undefined): string {
  return `$${Number(amount ?? 0).toLocaleString()}`
}
