import { describe, expect, it } from 'vitest'
import { toPage } from '@/utils/paging'

// P2：後端清單改為分頁回應的過渡期，前端同時接受舊的陣列與新的分頁物件
describe('toPage', () => {
  it('舊格式（陣列）：總筆數未知', () => {
    expect(toPage([{ id: 1 }, { id: 2 }], { page: 2, pageSize: 50 })).toEqual({
      items: [{ id: 1 }, { id: 2 }], totalCount: null, page: 2, pageSize: 50,
    })
  })

  it('新格式（分頁物件）：照後端回傳', () => {
    const paged = { items: [{ id: 1 }], totalCount: 120, page: 3, pageSize: 50 }

    expect(toPage(paged, { page: 1, pageSize: 10 })).toEqual(paged)
  })
})
