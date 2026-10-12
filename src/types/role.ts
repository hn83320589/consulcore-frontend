import type { Schemas } from './schema'

// 角色權限 Role（契約 7.2，/api/roles）與權限模型（契約第 5 節）

export type RoleResponse = Schemas['RoleResponseDto']

export type UpdateRolePermissionsRequest = Schemas['UpdateRolePermissionsDto']

// 全部權限碼（契約 5.1，32 個），依模組分組供權限矩陣 UI 使用。
// 後端不提供 /roles/permissions 端點，故清單由前端維護。
export interface PermissionCodeDef {
  code: string
  label: string
}

export interface PermissionGroup {
  module: string
  moduleLabel: string
  permissions: PermissionCodeDef[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'client',
    moduleLabel: '個案',
    permissions: [
      { code: 'client.view', label: '檢視' },
      { code: 'client.create', label: '建立' },
      { code: 'client.update', label: '編輯' },
      { code: 'client.delete', label: '刪除' },
      { code: 'client.manage', label: '管理' },
    ],
  },
  {
    module: 'appointment',
    moduleLabel: '預約',
    permissions: [
      { code: 'appointment.view', label: '檢視' },
      { code: 'appointment.create', label: '建立' },
      { code: 'appointment.update', label: '編輯' },
      { code: 'appointment.delete', label: '刪除' },
    ],
  },
  {
    module: 'schedule',
    moduleLabel: '排班',
    permissions: [
      { code: 'schedule.view', label: '檢視' },
      { code: 'schedule.create', label: '建立' },
      { code: 'schedule.update', label: '編輯' },
      { code: 'schedule.delete', label: '刪除' },
    ],
  },
  {
    module: 'session',
    moduleLabel: '晤談紀錄',
    permissions: [
      { code: 'session.view', label: '檢視' },
      { code: 'session.create', label: '建立' },
      { code: 'session.update', label: '編輯' },
      { code: 'session.lock', label: '鎖定' },
    ],
  },
  {
    module: 'consent',
    moduleLabel: '同意書',
    permissions: [
      { code: 'consent.view', label: '檢視' },
      { code: 'consent.create', label: '建立' },
      { code: 'consent.update', label: '編輯' },
      { code: 'consent.void', label: '作廢' },
    ],
  },
  {
    module: 'billing',
    moduleLabel: '收費',
    permissions: [
      { code: 'billing.view', label: '檢視' },
      { code: 'billing.create', label: '建立' },
      { code: 'billing.update', label: '編輯' },
      { code: 'billing.refund', label: '退費' },
    ],
  },
  {
    module: 'management',
    moduleLabel: '管理',
    permissions: [
      { code: 'notification.manage', label: '通知管理' },
      { code: 'staff.manage', label: '人員管理' },
      { code: 'room.manage', label: '診間管理' },
      { code: 'audit.view', label: '稽核檢視' },
    ],
  },
  {
    module: 'performance',
    moduleLabel: '考核',
    permissions: [
      { code: 'performance.view', label: '檢視' },
      { code: 'performance.manage', label: '管理' },
    ],
  },
  {
    module: 'org',
    moduleLabel: '機構',
    permissions: [{ code: 'org.settings', label: '機構設定' }],
  },
]
