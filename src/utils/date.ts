/**
 * 以「本地時區」輸出 YYYY-MM-DD（後端 DateOnly 參數用）。
 * 不要用 toISOString().slice(0, 10)：它輸出 UTC，在 UTC+8 會把本地午夜～早上 8 點算成前一天。
 */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
