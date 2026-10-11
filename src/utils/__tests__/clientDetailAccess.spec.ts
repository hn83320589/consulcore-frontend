import { describe, expect, it } from 'vitest'
import { clientDetailAccess } from '@/utils/clientDetailAccess'

const can = (codes: string[]) => (code: string) => codes.includes(code)

// F6 + B9：個案詳情頁各區塊「能看」與「要不要去抓」用同一套規則
describe('clientDetailAccess', () => {
  it('心理師：可看晤談紀錄與備忘；沒有 billing.view 就不抓收費', () => {
    expect(clientDetailAccess('therapist', can(['client.view']))).toEqual({
      sessions: true, memos: true, billing: false, audit: false, staff: false,
    })
  })

  it('owner：臨床私密資料不抓；收費、稽核、人員依權限', () => {
    expect(clientDetailAccess('owner', can(['billing.view', 'staff.manage']))).toEqual({
      sessions: false, memos: false, billing: true, audit: true, staff: true,
    })
  })

  it('admin：有 billing.view 才看收費，看不到稽核分頁', () => {
    expect(clientDetailAccess('admin', can(['billing.view']))).toEqual({
      sessions: false, memos: false, billing: true, audit: false, staff: false,
    })
  })
})
