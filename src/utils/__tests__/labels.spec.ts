import { describe, expect, it } from 'vitest'
import {
  auditActionLabel, auditResourceLabel, genderLabel, genderOptions, roleLabel, rolesLabel,
} from '@/utils/labels'

// 個案性別、人員角色、稽核動作與資源原本直接顯示英文代碼（female、therapist、create、client_memo）
describe('labels', () => {
  it('性別代碼轉中文，自由輸入的文字照原樣', () => {
    expect(genderLabel('female')).toBe('女')
    expect(genderLabel('male')).toBe('男')
    expect(genderLabel('other')).toBe('其他')
    expect(genderLabel('非二元')).toBe('非二元')
    expect(genderLabel(null)).toBe('')
    expect(genderOptions.map((o) => o.value)).toEqual(['female', 'male', 'other'])
  })

  it('角色代碼轉中文，多角色以頓號連接', () => {
    expect(roleLabel('owner')).toBe('機構負責人')
    expect(rolesLabel(['therapist', 'client'])).toBe('心理師、個案')
    expect(roleLabel('custom_role')).toBe('custom_role')
  })

  it('稽核動作與資源轉中文，未知代碼照原樣', () => {
    expect(auditActionLabel('create')).toBe('建立')
    expect(auditActionLabel('login_failed')).toBe('登入失敗')
    expect(auditResourceLabel('client_memo')).toBe('個案備忘')
    expect(auditResourceLabel('organization')).toBe('機構')
    expect(auditActionLabel('brand_new')).toBe('brand_new')
  })
})
