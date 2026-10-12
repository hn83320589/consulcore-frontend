/** 伺服器分頁的一頁資料。totalCount 為 null 代表後端沒有回傳總筆數（舊格式） */
export interface Page<T> {
  items: T[]
  totalCount: number | null
  page: number
  pageSize: number
}

/** 與後端 Paging.DefaultPageSize 相同 */
export const DEFAULT_PAGE_SIZE = 50

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

/**
 * 稽核、收費、通知清單由陣列改為分頁物件的過渡期：兩種格式都轉成 Page。
 * 後端全面改為分頁物件後，陣列分支即可移除。
 */
export function requestedPage(params?: { page?: number; pageSize?: number }) {
  return { page: params?.page ?? 1, pageSize: params?.pageSize ?? DEFAULT_PAGE_SIZE }
}

export function toPage<T>(data: T[] | PagedResponse<T>, requested: { page: number; pageSize: number }): Page<T> {
  if (Array.isArray(data)) return { items: data, totalCount: null, ...requested }
  return { items: data.items, totalCount: data.totalCount, page: data.page, pageSize: data.pageSize }
}
