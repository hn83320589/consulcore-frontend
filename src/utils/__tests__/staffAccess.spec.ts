import { describe, expect, it } from 'vitest'
import { assignableRoles, canManageUser } from '@/utils/staffAccess'

// 對應後端 B2：只有以 owner 身份操作時，才能指派 owner 角色或變更擁有者帳號
describe('staffAccess', () => {
  const roles = ['owner', 'admin', 'therapist', 'client']

  it('owner 身份可指派所有角色', () => {
    expect(assignableRoles(roles, 'owner')).toEqual(roles)
  })

  it('非 owner 身份不提供 owner 選項', () => {
    expect(assignableRoles(roles, 'admin')).toEqual(['admin', 'therapist', 'client'])
  })

  it('owner 身份可管理擁有者帳號', () => {
    expect(canManageUser({ roles: ['owner'] }, 'owner')).toBe(true)
  })

  it('非 owner 身份不可管理擁有者帳號', () => {
    expect(canManageUser({ roles: ['owner', 'therapist'] }, 'admin')).toBe(false)
  })

  it('非 owner 身份仍可管理一般人員', () => {
    expect(canManageUser({ roles: ['therapist'] }, 'admin')).toBe(true)
  })
})
